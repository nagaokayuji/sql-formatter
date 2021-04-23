import * as sqlFormatter from '../src/sqlFormatter';
import supportsDomaComments from './features/domaComments';
import supportsOperators from './features/operators';

describe('MySqlFormatter(Doma)', () => {
  const format = (query, cfg = {}) =>
    sqlFormatter.format(query, { ...cfg, language: 'mysql', isDoma: true });

  // behavesLikeMariaDbFormatter(format);
  supportsDomaComments(format);

  describe('additional MySQL operators', () => {
    supportsOperators(format, ['->', '->>']);
  });
});
