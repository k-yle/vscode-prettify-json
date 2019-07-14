import {
  ExtensionContext,
  Position,
  Range,
  window,
  commands,
  workspace,
} from 'vscode';

import * as stripComments from 'strip-json-comments';
import * as prettyCompact from 'json-stringify-pretty-compact';
import * as jsonlint from 'jsonlint';

const LINE_SEPERATOR = /\n|\r\n/;

// TODO: make this configurable.
const JSON_SPACE = 4;

export function activate(context: ExtensionContext): void {
  const disposable = commands.registerCommand('extension.prettifyCompact', (): void => {
    const editor = window.activeTextEditor;

    if (!editor) return;


    const editorConfig = workspace.getConfiguration('editor');
    const tabSize = editorConfig.get('tabSize', JSON_SPACE);

    const raw = editor.document.getText();
    let json = null;

    try {
      json = jsonlint.parse(stripComments(raw));
    } catch ({ message }) {
      const lineNumber = parseInt(message.substring(message.indexOf('line ') + 5, message.indexOf(':')), 10);
      console.error(`Line ${lineNumber}: ${message}`);

      return;
    }

    const pretty = prettyCompact(json, {
      indent: tabSize,
      maxLength: 200,
    });

    editor.edit((builder): void => {
      const start = new Position(0, 0);
      const lines = raw.split(LINE_SEPERATOR);
      const end = new Position(lines.length, lines[lines.length - 1].length);
      const allRange = new Range(start, end);
      builder.replace(allRange, pretty);
    }).then((): void => {
      // TODO: unselect the text
    });
  });

  context.subscriptions.push(disposable);
}
