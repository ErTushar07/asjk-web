const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, './');

const program = ts.createProgram({
  rootNames: parsedConfig.fileNames,
  options: {
    ...parsedConfig.options,
    noEmit: true,
    skipLibCheck: true
  }
});

const diagnostics = ts.getPreEmitDiagnostics(program);

if (diagnostics.length === 0) {
  console.log('TypeScript verification: 0 errors! ALL TYPE CHECKS PASS CLEANLY.');
} else {
  console.log(`TypeScript verification: ${diagnostics.length} errors found:`);
  diagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });
}
