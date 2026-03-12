const FIELD_OPTIONS = {
  jplatpat: [
    { value: 'TI', label: '発明の名称 (TI)' },
    { value: 'AB', label: '要約 (AB)' },
    { value: 'CL', label: '請求項 (CL)' },
    { value: 'FT', label: '全文 (FT)' },
    { value: 'IPC', label: 'IPC分類 (IPC)' },
  ],
  lens: [
    { value: 'title', label: 'Title (title)' },
    { value: 'abstract', label: 'Abstract (abstract)' },
    { value: 'claim', label: 'Claim (claim)' },
    { value: 'full_text', label: 'Full text (full_text)' },
    { value: 'cpc', label: 'CPC (cpc)' },
  ],
};

let nodeCounter = 1;
let currentTarget = 'jplatpat';

const createGroup = (operator = 'AND') => ({
  id: `n${nodeCounter++}`,
  type: 'group',
  operator,
  children: [],
});

const createCondition = (field, keyword = '', negate = false) => ({
  id: `n${nodeCounter++}`,
  type: 'condition',
  field,
  keyword,
  negate,
});

const rootNode = createGroup('AND');
rootNode.children.push(createCondition(FIELD_OPTIONS.jplatpat[0].value, 'battery', false));
rootNode.children.push(createCondition(FIELD_OPTIONS.jplatpat[1].value, 'electrolyte', false));

const builderRoot = document.getElementById('builder-root');
const outputEl = document.getElementById('query-output');
const csvPreviewEl = document.getElementById('csv-preview');
const copyStatusEl = document.getElementById('copy-status');

const groupTemplate = document.getElementById('group-template');
const conditionTemplate = document.getElementById('condition-template');

function getFieldsForCurrentTarget() {
  return FIELD_OPTIONS[currentTarget];
}

function ensureFieldCompatibility(conditionNode) {
  const fields = getFieldsForCurrentTarget();
  if (!fields.some((f) => f.value === conditionNode.field)) {
    conditionNode.field = fields[0].value;
  }
}

function findNodeAndParent(targetId, node = rootNode, parent = null) {
  if (node.id === targetId) return { node, parent };
  if (node.type === 'group') {
    for (const child of node.children) {
      const found = findNodeAndParent(targetId, child, node);
      if (found) return found;
    }
  }
  return null;
}

function render() {
  builderRoot.innerHTML = '';
  builderRoot.appendChild(renderNode(rootNode, true));
  outputEl.value = buildQuery(rootNode);
  csvPreviewEl.value = serializeCsv(rootNode);
}

function renderNode(node, isRoot = false) {
  if (node.type === 'group') {
    const fragment = groupTemplate.content.cloneNode(true);
    const el = fragment.querySelector('.group-node');
    const operatorSelect = el.querySelector('.group-operator');
    const removeBtn = el.querySelector('.remove-node');
    const childrenWrap = el.querySelector('.children');

    el.dataset.nodeId = node.id;
    operatorSelect.value = node.operator;
    removeBtn.disabled = isRoot;

    operatorSelect.addEventListener('change', (e) => {
      node.operator = e.target.value;
      render();
    });

    el.querySelector('.add-condition').addEventListener('click', () => {
      node.children.push(createCondition(getFieldsForCurrentTarget()[0].value));
      render();
    });

    el.querySelector('.add-group').addEventListener('click', () => {
      node.children.push(createGroup('AND'));
      render();
    });

    removeBtn.addEventListener('click', () => removeNode(node.id));

    for (const child of node.children) {
      childrenWrap.appendChild(renderNode(child));
    }

    return fragment;
  }

  ensureFieldCompatibility(node);
  const fragment = conditionTemplate.content.cloneNode(true);
  const el = fragment.querySelector('.condition-node');
  const fieldSelect = el.querySelector('.field-select');
  const keywordInput = el.querySelector('.keyword-input');
  const negateInput = el.querySelector('.negate-input');

  el.dataset.nodeId = node.id;
  fieldSelect.innerHTML = getFieldsForCurrentTarget()
    .map((field) => `<option value="${field.value}">${field.label}</option>`)
    .join('');

  fieldSelect.value = node.field;
  keywordInput.value = node.keyword;
  negateInput.checked = node.negate;

  fieldSelect.addEventListener('change', (e) => {
    node.field = e.target.value;
    render();
  });

  keywordInput.addEventListener('input', (e) => {
    node.keyword = e.target.value;
    outputEl.value = buildQuery(rootNode);
    csvPreviewEl.value = serializeCsv(rootNode);
  });

  negateInput.addEventListener('change', (e) => {
    node.negate = e.target.checked;
    render();
  });

  el.querySelector('.remove-node').addEventListener('click', () => removeNode(node.id));
  return fragment;
}

function removeNode(nodeId) {
  const pair = findNodeAndParent(nodeId);
  if (!pair || !pair.parent) return;

  pair.parent.children = pair.parent.children.filter((child) => child.id !== nodeId);
  render();
}

function quoteTerm(keyword) {
  const trimmed = keyword.trim();
  if (!trimmed) return '""';
  if (/\s/.test(trimmed)) return `"${trimmed.replaceAll('"', '\\"')}"`;
  return trimmed;
}

function formatCondition(node) {
  const term = quoteTerm(node.keyword);
  if (currentTarget === 'jplatpat') {
    return `${node.field}=(${term})`;
  }
  return `${node.field}:${term}`;
}

function buildQuery(node) {
  if (node.type === 'condition') {
    const base = formatCondition(node);
    return node.negate ? `NOT (${base})` : base;
  }

  if (!node.children.length) return '';
  const builtChildren = node.children.map((child) => buildQuery(child)).filter(Boolean);
  if (!builtChildren.length) return '';
  if (builtChildren.length === 1) return builtChildren[0];
  return `(${builtChildren.join(` ${node.operator} `)})`;
}

function flattenTree(node, parentId = '') {
  const rows = [];
  if (node.type === 'group') {
    rows.push([node.id, parentId, 'group', node.operator, '', '', '']);
    for (const child of node.children) {
      rows.push(...flattenTree(child, node.id));
    }
  } else {
    rows.push([
      node.id,
      parentId,
      'condition',
      '',
      node.field,
      node.keyword.replaceAll('\n', ' '),
      String(node.negate),
    ]);
  }
  return rows;
}

function csvEscape(value) {
  const stringValue = String(value ?? '');
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

function serializeCsv(node) {
  const header = ['id', 'parent_id', 'type', 'operator', 'field', 'keyword', 'negate'];
  const rows = flattenTree(node).map((r) => r.map(csvEscape).join(','));
  return [header.join(','), ...rows].join('\n');
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length < 2) {
    throw new Error('CSVにデータ行がありません。');
  }

  const records = lines.map(parseCsvLine);
  const [header, ...dataRows] = records;
  const expected = ['id', 'parent_id', 'type', 'operator', 'field', 'keyword', 'negate'];
  if (header.join(',') !== expected.join(',')) {
    throw new Error('CSVヘッダーが想定と異なります。');
  }

  const map = new Map();
  for (const row of dataRows) {
    const [id, parentId, type, operator, field, keyword, negate] = row;
    if (!id || !type) throw new Error('id/typeが不足している行があります。');
    if (type === 'group') {
      map.set(id, { id, parentId, type, operator: operator || 'AND', children: [] });
    } else if (type === 'condition') {
      map.set(id, {
        id,
        parentId,
        type,
        field: field || getFieldsForCurrentTarget()[0].value,
        keyword: keyword || '',
        negate: negate === 'true',
      });
    } else {
      throw new Error(`不正なtype: ${type}`);
    }
  }

  let root = null;
  for (const node of map.values()) {
    if (!node.parentId) {
      if (root) throw new Error('ルートノードが複数あります。');
      if (node.type !== 'group') throw new Error('ルートノードはgroupである必要があります。');
      root = node;
    } else {
      const parent = map.get(node.parentId);
      if (!parent || parent.type !== 'group') {
        throw new Error(`親ノードが見つかりません: ${node.id}`);
      }
      parent.children.push(node);
    }
  }

  if (!root) throw new Error('ルートノードが見つかりません。');
  return root;
}

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }

  fields.push(current);
  return fields;
}

function triggerDownload(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  document.querySelectorAll('.target-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentTarget = btn.dataset.target;
      document.querySelectorAll('.target-button').forEach((b) => b.classList.toggle('active', b === btn));
      render();
    });
  });

  document.getElementById('add-condition').addEventListener('click', () => {
    rootNode.children.push(createCondition(getFieldsForCurrentTarget()[0].value));
    render();
  });

  document.getElementById('add-group').addEventListener('click', () => {
    rootNode.children.push(createGroup('AND'));
    render();
  });

  document.getElementById('reset-query').addEventListener('click', () => {
    rootNode.children = [];
    render();
  });

  document.getElementById('copy-output').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outputEl.value);
      copyStatusEl.textContent = 'コピーしました。';
      setTimeout(() => {
        copyStatusEl.textContent = '';
      }, 1300);
    } catch {
      copyStatusEl.textContent = 'コピーに失敗しました。';
    }
  });

  document.getElementById('export-csv').addEventListener('click', () => {
    triggerDownload(`query_${currentTarget}.csv`, serializeCsv(rootNode));
  });

  document.getElementById('import-csv').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const importedRoot = parseCsv(text);
      rootNode.id = importedRoot.id;
      rootNode.operator = importedRoot.operator;
      rootNode.children = importedRoot.children;
      render();
    } catch (err) {
      alert(`CSV取り込みエラー: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  });
}

bindEvents();
render();
