import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator, Image,
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
import * as authService from '../services/authService';
import CameraModal from '../components/CameraModal';
import SubmitModal from '../components/SubmitModal';

const FALLBACK_TEMPLATE_ID = '9aabc527-205b-4d8b-a3cb-29cdf4855251';

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

      console.log('[DEBUG] full schema:', JSON.stringify(schema));
      console.log('[DEBUG] schema keys:', Object.keys(schema));
      console.log('[DEBUG] nodes exists:', !!(schema as any).nodes);
      console.log('[DEBUG] nodes length:', (schema as any).nodes?.length);
      console.log('[DEBUG] questions exists:', !!(schema as any).questions);

      if (isGraphSchema(schema) && schema.nodes.length > 0) {
        const nodeMap = new Map(schema.nodes.map(n => [n.id, n]));
        const rootId  = findRoot(schema.nodes, schema.edges);
        const path    = buildInitialPath(rootId, nodeMap, schema.edges, initial);
        console.log(`[Checklist] schema shape: graph, root: ${rootId}`);
        setGraphNodes(schema.nodes);
        setGraphEdges(schema.edges);
        setVisibleNodeIds(path);
        setSchemaMode('graph');
      } else {
        // isFlatSchema covers both the flat case and any unrecognised schema shape
        console.log('[Checklist] schema shape: flat');
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
    if (cur === 'pass')                             { circleIcon = 'checkmark';              circleColor = Colors.green; }
    else if (cur === 'fail')                        { circleIcon = 'close';                  circleColor = Colors.red;   }
    else if (cur === 'na')                          { circleIcon = 'remove';                 circleColor = '#94A3B8';    }
    else if (cur && cur !== undefined)              { circleIcon = 'checkmark-circle-outline'; circleColor = Colors.green; }

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
            <View style={[styles.tag, { backgroundColor: Colors.greenLight }]}>
              <Text style={[styles.tagText, { color: Colors.greenDark }]}>Pass</Text>
            </View>
          ) : cur === 'fail' ? (
            <View style={[styles.tag, { backgroundColor: Colors.redLight }]}>
              <Text style={[styles.tagText, { color: Colors.red }]}>Fail</Text>
            </View>
          ) : cur === 'na' ? (
            <View style={[styles.tag, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Text style={[styles.tagText, { color: '#475569' }]}>N/A</Text>
            </View>
          ) : cur ? (
            <View style={[styles.tag, { backgroundColor: Colors.greenLight }]}>
              <Text style={[styles.tagText, { color: Colors.greenDark }]}>Done</Text>
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
          style={[styles.answerBtn, cur === 'pass' ? styles.answerBtnPassActive : { borderColor: Colors.green }]}
          onPress={() => onAnswer('pass')}
        >
          <Text style={[styles.answerBtnText, { color: Colors.green }]}>Pass</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.answerBtn, cur === 'fail' ? styles.answerBtnFailActive : { borderColor: Colors.red }]}
          onPress={() => onAnswer('fail')}
        >
          <Text style={[styles.answerBtnText, { color: Colors.red }]}>Fail</Text>
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
          const cur     = responses[q.question_id];
          return (
            <View
              key={q.question_id}
              style={[
                styles.questionCard,
                { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
                blocked && styles.questionCardBlocked,
              ]}
            >
              {renderCardHeader(q.question_id, cur, blocked)}
              <Text style={[styles.qText, { color: blocked ? theme.text3 : theme.text }]}>
                {blocked ? 'Blocked — prerequisite not met' : q.label}
              </Text>
              {q.type === 'booleanNode' && !blocked &&
                renderBooleanButtons(q.question_id, q.type, cur, val => handleFlatAnswer(q.question_id, val))
              }
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
      <View style={[styles.topBar, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: theme.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Checklist</Text>
        <View style={[styles.offlineBadge, { backgroundColor: isDark ? '#1E293B' : Colors.grayLight, borderColor: theme.borderColor }]}>
          <Text style={[styles.offlineText, { color: theme.text2 }]}>OFFLINE</Text>
        </View>
      </View>

      {/* ── PROGRESS BAR ── */}
      <View style={[styles.progressContainer, { backgroundColor: theme.white, borderBottomColor: theme.borderColor }]}>
        <View style={[styles.progressWrap, { backgroundColor: theme.borderColor }]}>
          <View style={[styles.progressFill, { width: `${progressFillPct}%` as any }]} />
        </View>
        <Text style={[styles.progressLabel, { color: theme.text2 }]}>{progressLabel}</Text>
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
            handleGraphAnswer(activeNodeId, 'camera', uri);
          }
        }}
      />

      {/* ── BOTTOM FINISH BUTTON ── */}
      {!loading && !error && (
        <View style={[styles.bottomBar, { backgroundColor: theme.white, borderTopColor: theme.borderColor }]}>
          <TouchableOpacity style={styles.btnFinish} onPress={() => setSubmitModalVisible(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark" size={18} color={Colors.white} />
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
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: { fontSize: 28, lineHeight: 32 },
  topBarTitle: { fontSize: 17, fontWeight: '600' },
  offlineBadge: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  offlineText: { fontSize: 11, fontWeight: '700' },
  progressContainer: { padding: 12, borderBottomWidth: 1 },
  progressWrap: { height: 6, borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 99 },
  progressLabel: { fontSize: 12, textAlign: 'right' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  body: { flex: 1, padding: 16 },
  questionCard: {
    borderRadius: 14, borderWidth: 1,
    padding: 14, marginBottom: 10,
  },
  questionCardBlocked: { opacity: 0.5 },
  qHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  qHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  qCodeBadge: {
    backgroundColor: Colors.greenLight, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  qCodeText: { fontSize: 11, fontWeight: '700', color: Colors.green },
  tag: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '600' },
  circleIndicator: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  circlePass: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  circleFail: { borderColor: Colors.red,   backgroundColor: Colors.redLight   },
  circleNa:   { borderColor: '#94A3B8',    backgroundColor: '#F1F5F9'         },
  qText: { fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 6 },
  answerBtnRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  answerBtn: {
    flex: 1, borderRadius: 10, borderWidth: 1.5,
    paddingVertical: 8, alignItems: 'center',
  },
  answerBtnPassActive: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  answerBtnFailActive: { backgroundColor: Colors.redLight,   borderColor: Colors.red   },
  answerBtnNaActive:   { backgroundColor: '#F1F5F9',         borderColor: '#94A3B8'    },
  answerBtnText: { fontSize: 13, fontWeight: '600' },
  placeholderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, marginTop: 10,
  },
  placeholderText: { fontSize: 13 },
  cameraInputWrap: { marginTop: 10 },
  photoPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  photoThumbnail: { width: 80, height: 80, borderRadius: 8 },
  endLabel: { textAlign: 'center', fontSize: 11, padding: 12 },
  bottomBar: { borderTopWidth: 1, padding: 12 },
  btnFinish: {
    backgroundColor: Colors.green, borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  btnFinishText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  savedLabel: { textAlign: 'center', fontSize: 11, marginTop: 6, marginBottom: 4 },
});
