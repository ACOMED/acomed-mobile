import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator, Image, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useTheme, DarkColors, LightColors } from '../theme/ThemeContext';
import {
  fetchAudit, fetchTemplate,
  Question, GraphNode, GraphEdge,
  isFlatSchema, isGraphSchema,
} from '../services/auditService';
import { saveAnswer } from '../services/syncService';
import { setLocalAuditStatus } from '../services/auditStatusService';
import * as authService from '../services/authService';
import CameraModal from '../components/CameraModal';
import SubmitModal from '../components/SubmitModal';

const FALLBACK_TEMPLATE_ID = '10ed2d2b-b2e7-468e-b647-6d991c341535';

// ── Pure graph helpers (no component state) ───────────────────────────────────

function findRoot(nodes: GraphNode[], edges: GraphEdge[]): string {
  const targets = new Set(edges.map(e => e.targetNodeId));
  return nodes.find(n => !targets.has(n.id))?.id ?? nodes[0]?.id ?? '';
}

// Maps a user answer value to the edge handle expected by the graph.
// boolean/booleanNode: pass→yes, fail→no, anything else→out.
// All other node types follow the unconditional 'out' edge.
function resolveHandle(type: string, answer: string): 'yes' | 'no' | 'out' {
  if (type === 'boolean' || type === 'booleanNode') {
    if (answer === 'pass') return 'yes';
    if (answer === 'fail') return 'no';
  }
  return 'out';
}

function findNextNodeId(
  edges: GraphEdge[],
  fromId: string,
  type: string,
  answer: string,
): string | null {
  const handle = resolveHandle(type, answer);
  const edge =
    edges.find(e => e.sourceNodeId === fromId && e.sourceHandle === handle) ??
    edges.find(e => e.sourceNodeId === fromId && e.sourceHandle === 'out');
  return edge?.targetNodeId ?? null;
}

// Replays existing responses through the graph to reconstruct the already-traversed path.
function buildInitialPath(
  rootId: string,
  nodeMap: Map<string, GraphNode>,
  edges: GraphEdge[],
  responses: Record<string, string>,
): string[] {
  const path = [rootId];
  let cur = rootId;
  while (true) {
    const answer = responses[cur];
    if (!answer) break;
    const node = nodeMap.get(cur);
    if (!node) break;
    const next = findNextNodeId(edges, cur, node.type, answer);
    if (!next || path.includes(next)) break; // end of graph or cycle guard
    path.push(next);
    cur = next;
  }
  return path;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChecklistScreen({ route, navigation }: any) {
  const { isDark } = useTheme();
  const theme = isDark ? DarkColors : LightColors;

  const { auditId } = route.params as { auditId: string };

  // ── Shared state ──────────────────────────────────────────────────────────
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [responses, setResponses]   = useState<Record<string, string>>({});
  const [schemaMode, setSchemaMode] = useState<'flat' | 'graph' | null>(null);

  // ── Flat-mode state ───────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<Question[]>([]);

  // ── Graph-mode state ──────────────────────────────────────────────────────
  const [graphNodes, setGraphNodes]         = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges]         = useState<GraphEdge[]>([]);
  const [visibleNodeIds, setVisibleNodeIds] = useState<string[]>([]);

  // ── Camera state ──────────────────────────────────────────────────────────
  const [cameraVisible, setCameraVisible] = useState(false);
  const [photoUris, setPhotoUris]         = useState<Record<string, string>>({});
  const [activeNodeId, setActiveNodeId]   = useState<string | null>(null);

  // ── Submit state ──────────────────────────────────────────────────────────
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting]             = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      let audit;
      try {
        audit = await fetchAudit(auditId);
      } catch (e) {
        setError('Failed to load audit. Please try again.');
        setLoading(false);
        return;
      }

      const initial: Record<string, string> = {};
      audit.responses?.forEach((a: any) => { initial[a.question_id] = a.answer_value; });
      setResponses(initial);

      let template;
      try {
        const templateId = audit.template_id ?? FALLBACK_TEMPLATE_ID;
        template = await fetchTemplate(templateId);
      } catch (e) {
        setError('Failed to load checklist questions. Please try again.');
        setLoading(false);
        return;
      }

      const { schema } = template;

      if (isGraphSchema(schema) && schema.nodes.length > 0) {
        const nodeMap = new Map(schema.nodes.map(n => [n.id, n]));
        const rootId  = findRoot(schema.nodes, schema.edges);
        const path    = buildInitialPath(rootId, nodeMap, schema.edges, initial);
        setGraphNodes(schema.nodes);
        setGraphEdges(schema.edges);
        setVisibleNodeIds(path);
        setSchemaMode('graph');
      } else {
        // isFlatSchema covers both the flat case and any unrecognised schema shape
        setQuestions(isFlatSchema(schema) ? schema.questions : []);
        setSchemaMode('flat');
      }

      setLoading(false);
    }
    load();
  }, [auditId]);

  // ── Flat helpers ──────────────────────────────────────────────────────────

  function isBlocked(q: Question): boolean {
    if (!q.parent_question_id || !q.prerequisite_condition) return false;
    const parentValue = responses[q.parent_question_id];
    if (q.prerequisite_condition === 'EQUALS_YES') return parentValue !== 'pass';
    if (q.prerequisite_condition === 'EQUALS_NO')  return parentValue !== 'fail';
    if (q.prerequisite_condition === 'COMPLETED')  return !parentValue || parentValue === '';
    return false;
  }

  async function handleFlatAnswer(questionId: string, value: string) {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    await saveAnswer(auditId, questionId, value);
  }

  // ── Graph helpers ─────────────────────────────────────────────────────────

  async function handleGraphAnswer(nodeId: string, nodeType: string, value: string) {
    setResponses(prev => ({ ...prev, [nodeId]: value }));
    await saveAnswer(auditId, nodeId, value);
    // Only advance the path when answering the current (last) node.
    // Re-answering a previous node updates the stored value but does not re-traverse.
    if (visibleNodeIds[visibleNodeIds.length - 1] === nodeId) {
      const next = findNextNodeId(graphEdges, nodeId, nodeType, value);
      if (next) {
        setVisibleNodeIds(prev => prev.includes(next) ? prev : [...prev, next]);
      }
    }
  }

  // ── Progress ──────────────────────────────────────────────────────────────

  const flatApplicable = schemaMode === 'flat' ? questions.filter(q => !isBlocked(q)) : [];
  const flatAnswered   = flatApplicable.filter(q => responses[q.question_id]);
  const flatProgress   = flatApplicable.length > 0
    ? Math.round((flatAnswered.length / flatApplicable.length) * 100)
    : 0;

  const graphAnsweredCount = visibleNodeIds.filter(id => responses[id]).length;

  const progressLabel = schemaMode === 'graph'
    ? `${graphAnsweredCount} answered`
    : `${flatAnswered.length}/${flatApplicable.length} items • ${flatProgress}%`;

  // Graph uses answered/visible as a best-effort fill; flat uses the real percentage.
  const progressFillPct = schemaMode === 'graph'
    ? (visibleNodeIds.length > 0
        ? Math.round((graphAnsweredCount / visibleNodeIds.length) * 100)
        : 0)
    : flatProgress;

  // ── Submit stats (derived — no extra state) ──────────────────────────────

  const stats = schemaMode === 'graph'
    ? {
        total:    visibleNodeIds.length,
        answered: graphAnsweredCount,
        fails:    visibleNodeIds.filter(id => responses[id] === 'fail').length,
      }
    : {
        total:    flatApplicable.length,
        answered: flatAnswered.length,
        fails:    flatApplicable.filter(q => responses[q.question_id] === 'fail').length,
      };

  // ── Submit handler ────────────────────────────────────────────────────────

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const token = await authService.getToken();
      await setLocalAuditStatus(auditId, 'soumis');
      await fetch(`https://api.acomed.tech/api/audits/${auditId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'soumis' }),
      });
    } catch (e) {
      console.warn('[Checklist] Submit failed — will retry on sync', e);
      // Offline submit is acceptable — sync engine will retry
    } finally {
      setIsSubmitting(false);
      setSubmitModalVisible(false);
      navigation.goBack();
    }
  }

  // ── Shared card header ────────────────────────────────────────────────────

  function renderCardHeader(qId: string, cur: string | undefined, blocked: boolean) {
    let circleIcon: any = 'ellipse-outline';
    let circleColor     = theme.text3;
    if (cur === 'pass')        { circleIcon = 'checkmark';               circleColor = '#1A6B4A'; }
    else if (cur === 'fail')   { circleIcon = 'close';                   circleColor = '#C0392B'; }
    else if (cur === 'na')     { circleIcon = 'remove';                  circleColor = '#94A3B8'; }
    else if (cur)              { circleIcon = 'checkmark-circle-outline'; circleColor = '#1A6B4A'; }

    return (
      <View style={styles.qHeader}>
        <View style={styles.qHeaderLeft}>
          <View style={styles.qCodeBadge}>
            <Text style={styles.qCodeText}>{qId}</Text>
          </View>
          {blocked ? (
            <View style={[styles.tag, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Text style={[styles.tagText, { color: '#64748B' }]}>Blocked</Text>
            </View>
          ) : cur === 'pass' ? (
            <View style={[styles.tag, { backgroundColor: '#E8F5EF' }]}>
              <Text style={[styles.tagText, { color: '#1A6B4A' }]}>Pass</Text>
            </View>
          ) : cur === 'fail' ? (
            <View style={[styles.tag, { backgroundColor: '#FDEDEC' }]}>
              <Text style={[styles.tagText, { color: '#C0392B' }]}>Fail</Text>
            </View>
          ) : cur === 'na' ? (
            <View style={[styles.tag, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Text style={[styles.tagText, { color: '#475569' }]}>N/A</Text>
            </View>
          ) : cur ? (
            <View style={[styles.tag, { backgroundColor: '#E8F5EF' }]}>
              <Text style={[styles.tagText, { color: '#1A6B4A' }]}>Done</Text>
            </View>
          ) : (
            <View style={[styles.tag, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}>
              <Text style={[styles.tagText, { color: isDark ? '#94A3B8' : Colors.gray }]}>Pending</Text>
            </View>
          )}
        </View>
        <View style={[
          styles.circleIndicator, { borderColor: theme.borderColor },
          cur === 'pass' && styles.circlePass,
          cur === 'fail' && styles.circleFail,
          cur === 'na'   && styles.circleNa,
          blocked && { borderColor: theme.borderColor, backgroundColor: isDark ? '#1E293B' : Colors.grayLight },
        ]}>
          <Ionicons name={circleIcon} size={14} color={circleColor} />
        </View>
      </View>
    );
  }

  // ── Boolean answer buttons ────────────────────────────────────────────────

  function renderBooleanButtons(
    id: string,
    type: string,
    cur: string | undefined,
    onAnswer: (val: string) => void,
  ) {
    return (
      <View style={styles.answerBtnRow}>
        <TouchableOpacity
          style={[styles.answerBtn, cur === 'pass' ? styles.answerBtnPassActive : { borderColor: '#1A6B4A' }]}
          onPress={() => onAnswer('pass')}
        >
          <Text style={[styles.answerBtnText, { color: '#1A6B4A' }]}>Pass</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.answerBtn, cur === 'fail' ? styles.answerBtnFailActive : { borderColor: '#C0392B' }]}
          onPress={() => onAnswer('fail')}
        >
          <Text style={[styles.answerBtnText, { color: '#C0392B' }]}>Fail</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.answerBtn, cur === 'na' ? styles.answerBtnNaActive : { borderColor: '#94A3B8' }]}
          onPress={() => onAnswer('na')}
        >
          <Text style={[styles.answerBtnText, { color: '#64748B' }]}>N/A</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Graph node input (only shown on the current/last node) ────────────────

  function renderNodeInput(node: GraphNode, cur: string | undefined) {
    switch (node.type) {
      case 'boolean':
      case 'booleanNode':
        return renderBooleanButtons(
          node.id, node.type, cur,
          val => handleGraphAnswer(node.id, node.type, val),
        );

      case 'text':
        // TODO: replace with real TextInput and persist typed value
        return (
          <TouchableOpacity
            style={[styles.placeholderBtn, { borderColor: theme.borderColor, backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}
            onPress={() => handleGraphAnswer(node.id, node.type, 'done')}
          >
            <Ionicons name="create-outline" size={15} color={theme.text2} />
            <Text style={[styles.placeholderText, { color: theme.text2 }]}>Continue (text input — TODO)</Text>
          </TouchableOpacity>
        );

      case 'camera':
        return (
          <View style={styles.cameraInputWrap}>
            {photoUris[node.id] ? (
              <View style={styles.photoPreviewRow}>
                <Image source={{ uri: photoUris[node.id] }} style={styles.photoThumbnail} />
                <TouchableOpacity
                  style={[styles.placeholderBtn, { borderColor: theme.borderColor, backgroundColor: isDark ? '#1E293B' : Colors.grayLight, flex: 1 }]}
                  onPress={() => { setActiveNodeId(node.id); setCameraVisible(true); }}
                >
                  <Ionicons name="refresh-outline" size={15} color={theme.text2} />
                  <Text style={[styles.placeholderText, { color: theme.text2 }]}>Retake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.placeholderBtn, { borderColor: theme.borderColor, backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}
                onPress={() => { setActiveNodeId(node.id); setCameraVisible(true); }}
              >
                <Ionicons name="camera-outline" size={15} color={theme.text2} />
                <Text style={[styles.placeholderText, { color: theme.text2 }]}>Take Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'signature':
        // TODO: implement signature pad
        return (
          <TouchableOpacity
            style={[styles.placeholderBtn, { borderColor: theme.borderColor, backgroundColor: isDark ? '#1E293B' : Colors.grayLight }]}
            onPress={() => handleGraphAnswer(node.id, node.type, 'signature_placeholder')}
          >
            <Ionicons name="pencil-outline" size={15} color={theme.text2} />
            <Text style={[styles.placeholderText, { color: theme.text2 }]}>Sign here (TODO: signature pad)</Text>
          </TouchableOpacity>
        );

      default:
        // Unknown node type — fall back to boolean buttons
        return renderBooleanButtons(
          node.id, node.type, cur,
          val => handleGraphAnswer(node.id, node.type, val),
        );
    }
  }

  // ── Flat list ─────────────────────────────────────────────────────────────

  function renderFlatList() {
    return (
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {questions.map(q => {
          const blocked = isBlocked(q);
          if (blocked) return null;
          const cur     = responses[q.question_id];
          return (
            <View
              key={q.question_id}
              style={[styles.questionCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
            >
              <View style={[
                styles.cardAccent,
                cur === 'pass' && { backgroundColor: '#1A6B4A' },
                cur === 'fail' && { backgroundColor: '#C0392B' },
                cur === 'na'   && { backgroundColor: '#94A3B8' },
              ]} />
              {renderCardHeader(q.question_id, cur, false)}
              <Text style={[styles.qText, { color: theme.text }]}>{q.label}</Text>
              {(q.type === 'booleanNode' || q.type === 'boolean') &&
                renderBooleanButtons(q.question_id, q.type, cur, val => handleFlatAnswer(q.question_id, val))
              }
              {(q.type === 'text' || q.type === 'textNode') && (
                <TextInput
                  style={[styles.textInput, {
                    color: theme.text,
                    borderColor: theme.borderColor,
                    backgroundColor: theme.cardBg,
                  }]}
                  placeholder="Enter your response..."
                  placeholderTextColor={theme.text3}
                  value={responses[q.question_id] || ''}
                  onChangeText={(val) => handleFlatAnswer(q.question_id, val)}
                  multiline
                  numberOfLines={3}
                />
              )}
              {(q.type === 'camera' || q.type === 'photo') && (
                <TouchableOpacity
                  style={[styles.placeholderBtn, {
                    borderColor: theme.borderColor,
                    backgroundColor: isDark ? '#1E293B' : Colors.grayLight,
                  }]}
                  onPress={() => { setActiveNodeId(q.question_id); setCameraVisible(true); }}
                >
                  <Ionicons name="camera-outline" size={15} color={theme.text2} />
                  <Text style={[styles.placeholderText, { color: theme.text2 }]}>
                    {photoUris[q.question_id] ? 'Retake Photo' : 'Take Photo'}
                  </Text>
                </TouchableOpacity>
              )}
              {(q.type === 'camera' || q.type === 'photo') && photoUris[q.question_id] && (
                <Image source={{ uri: photoUris[q.question_id] }} style={styles.photoThumbnail} />
              )}
            </View>
          );
        })}
        <Text style={[styles.endLabel, { color: theme.text3 }]}>END OF CHECKLIST</Text>
        <View style={{ height: 120 }} />
      </ScrollView>
    );
  }

  // ── Graph list ────────────────────────────────────────────────────────────

  function renderGraphList() {
    const nodeMap   = new Map(graphNodes.map(n => [n.id, n]));
    const lastId    = visibleNodeIds[visibleNodeIds.length - 1];
    const lastNode  = lastId ? nodeMap.get(lastId) : undefined;
    const lastAns   = lastId ? responses[lastId] : undefined;

    // Show end-of-checklist when the last visible node is answered and has no outgoing edge.
    const isComplete = !!(lastNode && lastAns &&
      findNextNodeId(graphEdges, lastId, lastNode.type, lastAns) === null);

    return (
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {visibleNodeIds.map((nodeId, idx) => {
          const node      = nodeMap.get(nodeId);
          if (!node) return null;
          const cur       = responses[nodeId];
          const isCurrent = idx === visibleNodeIds.length - 1;

          return (
            <View
              key={nodeId}
              style={[styles.questionCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
            >
              <View style={[
                styles.cardAccent,
                cur === 'pass' && { backgroundColor: '#1A6B4A' },
                cur === 'fail' && { backgroundColor: '#C0392B' },
                cur === 'na'   && { backgroundColor: '#94A3B8' },
              ]} />
              {renderCardHeader(nodeId, cur, false)}
              <Text style={[styles.qText, { color: theme.text }]}>{node.label}</Text>
              {/* Only the last (current) unanswered node shows interactive inputs.
                  Previous nodes display their answer via the header tag only. */}
              {isCurrent && renderNodeInput(node, cur)}
            </View>
          );
        })}
        {isComplete && (
          <Text style={[styles.endLabel, { color: theme.text3 }]}>END OF CHECKLIST</Text>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? 35 : 0 }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: '#dde0e8' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Checklist</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* ── PROGRESS BAR ── */}
      <View style={[styles.progressContainer, { backgroundColor: theme.white, borderBottomColor: '#dde0e8' }]}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabelLeft}>AUDIT PROGRESS</Text>
          <Text style={[styles.progressLabelRight, { color: theme.text2 }]}>{progressLabel}</Text>
        </View>
        <View style={[styles.progressWrap, { backgroundColor: theme.borderColor }]}>
          <View style={[styles.progressFill, { width: `${progressFillPct}%` as any }]} />
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.green} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color={Colors.red} />
          <Text style={[styles.errorText, { color: Colors.red }]}>{error}</Text>
        </View>
      ) : schemaMode === 'flat' ? (
        renderFlatList()
      ) : (
        renderGraphList()
      )}

      {/* ── SUBMIT MODAL ── */}
      <SubmitModal
        visible={submitModalVisible}
        onClose={() => setSubmitModalVisible(false)}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
        stats={stats}
      />

      {/* ── CAMERA MODAL ── */}
      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onPhotoCaptured={(uri) => {
          if (activeNodeId) {
            setPhotoUris(prev => ({ ...prev, [activeNodeId]: uri }));
            if (schemaMode === 'flat') {
              handleFlatAnswer(activeNodeId, uri);
            } else {
              handleGraphAnswer(activeNodeId, 'camera', uri);
            }
          }
        }}
      />

      {/* ── BOTTOM FINISH BUTTON ── */}
      {!loading && !error && (
        <View style={[styles.bottomBar, { backgroundColor: theme.white, borderTopColor: '#dde0e8' }]}>
          <TouchableOpacity style={styles.btnFinish} onPress={() => setSubmitModalVisible(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark" size={18} color="#ffffff" />
              <Text style={styles.btnFinishText}>Terminer la visite</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.savedLabel, { color: theme.text3 }]}>Enregistrer localement • Dernière sauvegarde: il y a 2 min</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  backBtn: { fontSize: 28, lineHeight: 32, color: '#0d1b3e' },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: '#0d1b3e' },

  // Progress bar
  progressContainer: { padding: 12, borderBottomWidth: 0.5 },
  progressLabelRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6,
  },
  progressLabelLeft: {
    fontSize: 11, fontWeight: '600', color: '#8a8f9e',
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  progressLabelRight: { fontSize: 11 },
  progressWrap: { height: 8, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 99 },

  // Loading / error
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },

  // Body
  body: { flex: 1, padding: 16 },

  // Question cards
  questionCard: {
    borderRadius: 14, borderWidth: 0.5,
    padding: 16, marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#0d1b3e', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  cardAccent: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 3, borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
  },

  // Card header
  qHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  qHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  qCodeBadge: {
    backgroundColor: '#f5f6f9', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  qCodeText: { fontSize: 11, fontWeight: '600', color: '#8a8f9e' },
  tag: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '600' },
  circleIndicator: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  circlePass: { borderColor: '#1A6B4A', backgroundColor: '#E8F5EF' },
  circleFail: { borderColor: '#C0392B', backgroundColor: '#FDEDEC' },
  circleNa:   { borderColor: '#94A3B8', backgroundColor: '#F1F5F9' },

  // Question text
  qText: { fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 8 },

  // Answer buttons
  answerBtnRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  answerBtn: {
    flex: 1, borderRadius: 10, borderWidth: 1.5,
    paddingVertical: 12, alignItems: 'center',
  },
  answerBtnPassActive: { backgroundColor: '#E8F5EF', borderColor: '#1A6B4A' },
  answerBtnFailActive: { backgroundColor: '#FDEDEC', borderColor: '#C0392B' },
  answerBtnNaActive:   { backgroundColor: '#F1F5F9', borderColor: '#94A3B8' },
  answerBtnText: { fontSize: 13, fontWeight: '700' },

  // Camera / placeholder inputs
  placeholderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, marginTop: 10,
  },
  placeholderText: { fontSize: 13 },
  cameraInputWrap: { marginTop: 10 },
  photoPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  photoThumbnail: { width: 80, height: 80, borderRadius: 8 },

  // Text input
  textInput: {
    borderWidth: 1, borderRadius: 10,
    padding: 10, marginTop: 10,
    fontSize: 14, minHeight: 80,
    textAlignVertical: 'top',
  },

  // End of checklist
  endLabel: { textAlign: 'center', fontSize: 11, padding: 12 },

  // Bottom bar
  bottomBar: { borderTopWidth: 0.5, padding: 12 },
  btnFinish: {
    backgroundColor: '#0d1b3e', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  btnFinishText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  savedLabel: { textAlign: 'center', fontSize: 11, marginTop: 6, marginBottom: 4 },
});
