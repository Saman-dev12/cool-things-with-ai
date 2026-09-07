import Prism from 'prismjs';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-hcl';
import 'prismjs/components/prism-json';

export interface LanguageInfo {
  grammar: Prism.Grammar;
  lang: string;
  displayName: string;
}

export function getLanguageForFile(fileName: string): LanguageInfo {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.yaml') || lower.endsWith('.yml')) {
    return { grammar: Prism.languages.yaml, lang: 'yaml', displayName: 'YAML' };
  }
  if (lower.endsWith('.tf')) {
    return { grammar: Prism.languages.hcl, lang: 'hcl', displayName: 'HCL / Terraform' };
  }
  if (lower.endsWith('.sh') || lower === 'entrypoint.sh' || lower === 'run.sh') {
    return { grammar: Prism.languages.bash, lang: 'bash', displayName: 'Bash Shell' };
  }
  if (lower === 'dockerfile' || lower.includes('dockerfile') || lower.endsWith('.dockerfile')) {
    return { grammar: Prism.languages.docker, lang: 'docker', displayName: 'Dockerfile' };
  }
  if (lower.endsWith('.json')) {
    return { grammar: Prism.languages.json, lang: 'json', displayName: 'JSON' };
  }
  return { grammar: Prism.languages.yaml, lang: 'yaml', displayName: 'Configuration' };
}

export function highlightCode(code: string, fileName: string): string {
  if (!code) return '';
  try {
    const { grammar, lang } = getLanguageForFile(fileName);
    if (grammar) {
      return Prism.highlight(code, grammar, lang);
    }
  } catch (err) {
    console.warn('Prism highlight error:', err);
  }
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
