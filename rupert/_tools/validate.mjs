// A small JSON Schema (2020-12 subset) validator, enough for Rupert's schemas and dependency-free.
// Supports: type, const, enum, required, properties, additionalProperties:false, items,
// minItems, maxItems, minLength, maxLength, minimum, maximum, pattern, $ref to #/$defs/*.

const typeOf = v => v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v;
const typeOk = (v, t) => t === 'number' ? typeof v === 'number' : typeOf(v) === t || (t === 'number' && typeOf(v) === 'integer');

export function validate(value, schema, root = schema, path = '$') {
  const out = [];
  if (schema.$ref) {
    const name = schema.$ref.replace('#/$defs/', '');
    const target = root.$defs?.[name];
    if (!target) return [`${path}: unknown $ref ${schema.$ref}`];
    return validate(value, target, root, path);
  }
  if (schema.type) {
    const types = [].concat(schema.type);
    if (!types.some(t => typeOk(value, t))) return [`${path}: expected ${types.join(' or ')}, got ${typeOf(value)}`];
  }
  if ('const' in schema && value !== schema.const) out.push(`${path}: must be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) out.push(`${path}: must be one of ${schema.enum.join(', ')} (got ${JSON.stringify(value)})`);
  if (typeof value === 'string') {
    if (schema.minLength != null && value.length < schema.minLength) out.push(`${path}: shorter than ${schema.minLength}`);
    if (schema.maxLength != null && value.length > schema.maxLength) out.push(`${path}: longer than ${schema.maxLength} (${value.length})`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) out.push(`${path}: does not match ${schema.pattern}`);
  }
  if (typeof value === 'number') {
    if (schema.minimum != null && value < schema.minimum) out.push(`${path}: below ${schema.minimum}`);
    if (schema.maximum != null && value > schema.maximum) out.push(`${path}: above ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems != null && value.length < schema.minItems) out.push(`${path}: needs at least ${schema.minItems} items`);
    if (schema.maxItems != null && value.length > schema.maxItems) out.push(`${path}: at most ${schema.maxItems} items`);
    if (schema.items) value.forEach((v, i) => out.push(...validate(v, schema.items, root, `${path}[${i}]`)));
  }
  if (typeOf(value) === 'object') {
    for (const k of schema.required || []) if (!(k in value)) out.push(`${path}: missing "${k}"`);
    const props = schema.properties || {};
    for (const [k, v] of Object.entries(value)) {
      if (props[k]) out.push(...validate(v, props[k], root, `${path}.${k}`));
      else if (schema.additionalProperties === false) out.push(`${path}: unexpected property "${k}"`);
    }
  }
  return out;
}
