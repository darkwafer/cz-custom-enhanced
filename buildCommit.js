'use strict';


var wrap = require('word-wrap');


module.exports = function buildCommit(answers, config) {

  var maxLineWidth = 100;

  var wrapOptions = {
    trim: true,
    newline: '\n',
    indent: '',
    width: maxLineWidth
  };

  function addScope(scope) {
    if (!scope) return ': '; //it could be type === WIP. So there is no scope

    return '(' + scope.trim() + '): ';
  }

  function addSubject(subject) {
    return subject.trim();
  }

  function escapeSpecialChars(result) {
    var specialChars = ['\`'];

    specialChars.map(function (item) {
      // For some strange reason, we have to pass additional '\' slash to commitizen. Total slashes are 4.
      // If user types "feat: `string`", the commit preview should show "feat: `\\string\\`".
      // Don't worry. The git log will be "feat: `string`"
      result = result.replace(new RegExp(item, 'g'), '\\\\`');
    });
    return result;
  }
  var scope = answers.scope;
  if (answers.issue) {
    scope = config.issue[answers.type].name + '#' + answers.issue + ', ' + scope;
  }

  // Hard limit this line
  var head = (answers.type + addScope(scope) + addSubject(answers.subject)).slice(0, maxLineWidth);

  // Wrap these lines at 100 characters
  var body = ''
  if (config.body.hasOwnProperty(answers.type)) {
    var template = config.body[answers.type]
    Object.keys(template).forEach(function (name) {
      body = body.concat(answers[`body.${name}`]);
      body = wrap(body, wrapOptions) || '';
    });
  } else {
    // attach default body 
    body = wrap(answers.body, wrapOptions) || '';
  }

  body = body.split('|').join('\n');

  var breaking = wrap(answers.breaking, wrapOptions);
  var footer = wrap(answers.footer, wrapOptions);

  var result = head;
  if (body) {
    result += '\n\n' + body;
  }
  if (breaking) {
    var breakingPrefix = config && config.breakingPrefix ? config.breakingPrefix : 'BREAKING CHANGE:';
    result += '\n\n' + breakingPrefix + '\n' + breaking;
  }
  if (footer) {
    var footerPrefix = config && config.footerPrefix ? config.footerPrefix : 'ISSUES CLOSED:';
    result += '\n\n' + footerPrefix + ' ' + footer;
  }
  if (answers.issue) {
    result += '\n' + config.issue[answers.type].link.replace('###', answers.issue);
  }

  return escapeSpecialChars(result);
};