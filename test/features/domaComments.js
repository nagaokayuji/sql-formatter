import dedent from 'dedent-js';

/**
 * Tests for standard -- and /* *\/ comments
 * @param {Function} format
 */
export default function supportsDomaComments(format) {
  it('formats SELECT query with different comments', () => {
    const result = format(dedent`
      SELECT
      /*
       * This is a block comment
       */
      * FROM
      -- This is another comment
      MyTable -- One final comment
      WHERE 1 != 2;
    `);
    expect(result).toBe(dedent`
      SELECT
        /*
         * This is a block comment
         */*
      FROM
        -- This is another comment
        MyTable -- One final comment
      WHERE
        1 != 2;
    `);
  });

  it('maintains block comment indentation', () => {
    const sql = dedent`
      SELECT
        /*
         * This is a block comment
         */*
      FROM
        MyTable
      WHERE
        1 = 2;
    `;
    expect(format(sql)).toBe(sql);
  });

  it('formats tricky line comments', () => {
    expect(format('SELECT a--comment, here\nFROM b--comment')).toBe(dedent`
      SELECT
        a --comment, here
      FROM
        b --comment
    `);
  });

  it('formats line comments followed by semicolon', () => {
    expect(
      format(`
      SELECT a FROM b
      --comment
      ;
    `)
    ).toBe(dedent`
      SELECT
        a
      FROM
        b --comment
      ;
    `);
  });

  it('formats line comments followed by comma', () => {
    expect(
      format(dedent`
      SELECT a --comment
      , b
    `)
    ).toBe(dedent`
      SELECT
        a --comment
      ,
        b
    `);
  });

  it('formats line comments followed by close-paren', () => {
    expect(format('SELECT ( a --comment\n )')).toBe(dedent`
      SELECT
        (a --comment
      )
    `);
  });

  it('formats line comments followed by open-paren', () => {
    expect(format('SELECT a --comment\n()')).toBe(dedent`
      SELECT
        a --comment
        ()
    `);
  });

  it('recognizes line-comments with Windows line-endings (converts them to UNIX)', () => {
    const result = format('SELECT * FROM\r\n-- line comment 1\r\nMyTable -- line comment 2\r\n');
    expect(result).toBe('SELECT\n  *\nFROM\n  -- line comment 1\n  MyTable -- line comment 2');
  });

  it('formats query that ends with open comment', () => {
    const result = format(`
      SELECT count(*)
      /*Comment
    `);
    expect(result).toBe(dedent`
      SELECT
        count(*)
        /*Comment
    `);
  });

  it('doma bindings', () => {
    const result = format(`
      SELECT count(*)
      FROM
      tbl
      WHERE
      hoge = /* ishoge */1
      /*# orderBy */
    `);
    expect(result).toBe(dedent`
      SELECT
        count(*)
      FROM
        tbl
      WHERE
        hoge = /* ishoge */1
        /*# orderBy */
    `);
  });

  it('doma bindings [if]', () => {
    const result = format(`
      SELECT * FROM employee WHERE
      /*%if employeeId != null */
          employee_id != /* employeeId */99
        AND some_str != '9'
        /*%elseif condition */
        condition = /* hogehoge */''

      /*%end*/
    `);
    expect(result).toBe(dedent`
      SELECT
        *
      FROM
        employee
      WHERE
        /*%if employeeId != null */
          employee_id != /* employeeId */99
          AND some_str != '9'
        /*%elseif condition */
          condition = /* hogehoge */''
        /*%end*/
    `);
  });

  it('doma bindings [additional]', () => {
    const result = format(`
      SELECT * FROM employee WHERE
      /*%for name : names */
      employee_name LIKE /* name */'hoge'
        /*%if name_has_next */
      /*# "or" */
        /*%end */
      /*%end*/
      OR
      salary > 1000
    `);
    expect(result).toBe(dedent`
      SELECT
        *
      FROM
        employee
      WHERE
        /*%for name : names */
          employee_name LIKE /* name */'hoge'
          /*%if name_has_next */
            /*# "or" */
          /*%end */
        /*%end*/
        OR salary > 1000
    `);
  });

  it('doma expand', () => {
    const result = format(`
      SELECT /*%expand */* FROM employee WHERE /*# condition */
    `);
    expect(result).toBe(dedent`
      SELECT
        /*%expand */*
      FROM
        employee
      WHERE
        /*# condition */
    `);
  });
  it('doma literal variable directive', () => {
    const result = format(`
      SELECT
       * FROM employee WHERE code = /*^ code */'test'
    `);
    expect(result).toBe(dedent`
      SELECT
        *
      FROM
        employee
      WHERE
        code = /*^ code */'test'
    `);
  });
}
