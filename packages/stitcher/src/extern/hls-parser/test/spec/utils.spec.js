const test = require('ava');
const rewire = require('rewire');
const utils = require('../../utils');

utils.setOptions({strictMode: true});

test('utils.THROW', t => {
  try {
    utils.THROW(new Error('abc'));
  } catch (err) {
    t.truthy(err);
    t.is(err.message, 'abc');
  }
});

test('utils.ASSERT', t => {
  utils.ASSERT('No error occurred', 1, 2, 3);
  try {
    utils.ASSERT('Error occurred', 1, 2, false);
  } catch (err) {
    t.truthy(err);
    t.is(err.message, 'Error occurred : Failed at [2]');
  }
});

test('utils.CONDITIONALASSERT', t => {
  utils.CONDITIONALASSERT([true, 1], [true, 2], [true, 3]);
  utils.CONDITIONALASSERT([false, 0], [false, 1], [false, 2]);
  try {
    utils.CONDITIONALASSERT([false, 0], [true, 1], [true, 0]);
  } catch (err) {
    t.truthy(err);
    t.is(err.message, 'Conditional Assert : Failed at [2]');
  }
});

test('utils.PARAMCHECK', t => {
  utils.PARAMCHECK(1, 2, 3);
  try {
    utils.PARAMCHECK(1, 2, undefined);
  } catch (err) {
    t.truthy(err);
    t.is(err.message, 'Param Check : Failed at [2]');
  }
});

test('utils.CONDITIONALPARAMCHECK', t => {
  utils.CONDITIONALPARAMCHECK([true, 1], [true, 2], [true, 3]);
  utils.CONDITIONALPARAMCHECK([false, undefined], [false, 1], [false, 2]);
  try {
    utils.CONDITIONALPARAMCHECK([false, undefined], [true, 1], [true, undefined]);
  } catch (err) {
    t.truthy(err);
    t.is(err.message, 'Conditional Param Check : Failed at [2]');
  }
});

test('utils.toNumber', t => {
  t.is(utils.toNumber('123'), 123);
  t.is(utils.toNumber(123), 123);
  t.is(utils.toNumber('abc'), 0);
  t.is(utils.toNumber('8bc'), 8);
});

test('utils.hexToByteSequence', t => {
  t.deepEqual(utils.hexToByteSequence('0x000000'), new Uint8Array([0, 0, 0]));
  t.deepEqual(utils.hexToByteSequence('0xFFFFFF'), new Uint8Array([255, 255, 255]));
  t.deepEqual(utils.hexToByteSequence('FFFFFF'), new Uint8Array([255, 255, 255]));
});

test('utils.byteSequenceToHex', t => {
  t.is(utils.byteSequenceToHex(new Uint8Array([0, 0, 0])), '0x000000');
  t.is(utils.byteSequenceToHex(new Uint8Array([255, 255, 255])), '0xFFFFFF');
  t.is(utils.byteSequenceToHex(new Uint8Array([255, 255, 256])), '0xFFFF00');
});

test('utils.tryCatch', t => {
  let result = utils.tryCatch(
    () => {
      return 1;
    },
    () => {
      return 0;
    }
  );
  t.is(result, 1);
  result = utils.tryCatch(
    () => {
      return JSON.parse('{{');
    },
    () => {
      return 0;
    }
  );
  t.is(result, 0);
  t.throws(() => {
    utils.tryCatch(
      () => {
        return JSON.parse('{{');
      },
      () => {
        return JSON.parse('}}');
      }
    );
  });
});

test('utils.splitAt', t => {
  t.deepEqual(utils.splitAt('a=1', '='), ['a', '1']);
  t.deepEqual(utils.splitAt('a=1=2', '='), ['a', '1=2']);
  t.deepEqual(utils.splitAt('a=1=2=3', '='), ['a', '1=2=3']);
  t.deepEqual(utils.splitAt('a=1=2=3', '=', 0), ['a', '1=2=3']);
  t.deepEqual(utils.splitAt('a=1=2=3', '=', 1), ['a=1', '2=3']);
  t.deepEqual(utils.splitAt('a=1=2=3', '=', 2), ['a=1=2', '3']);
  t.deepEqual(utils.splitAt('a=1=2=3', '=', -1), ['a=1=2', '3']);
});

test('utils.trim', t => {
  t.is(utils.trim(' abc '), 'abc');
  t.is(utils.trim(' abc ', ' '), 'abc');
  t.is(utils.trim('"abc"', '"'), 'abc');
  t.is(utils.trim('abc:', ':'), 'abc');
  t.is(utils.trim('abc'), 'abc');
  t.is(utils.trim(' "abc" ', '"'), 'abc');
});

test('utils.splitWithPreservingQuotes', t => {
  t.deepEqual(utils.splitByCommaWithPreservingQuotes('abc=123, def="4,5,6", ghi=78=9, jkl="abc\'123\'def"'), ['abc=123', 'def="4,5,6"', 'ghi=78=9', 'jkl="abc\'123\'def"']);
});

test('utls.camelify', t => {
  const props = ['caption', 'Caption', 'captioN', 'CAPTION', 'closed-captions', 'closed_captions', 'CLOSED-CAPTIONS'];
  const results = ['caption', 'caption', 'caption', 'caption', 'closedCaptions', 'closedCaptions', 'closedCaptions'];
  t.deepEqual(props.map(p => utils.camelify(p)), results);
});

test('utils.formatDate', t => {
  const DATE = '2014-03-05T11:15:00.000Z';
  t.is(utils.formatDate(new Date(DATE)), DATE);
  const LOCALDATE = '2000-01-01T08:59:59.999+09:00';
  const UTC = '1999-12-31T23:59:59.999Z';
  t.is(utils.formatDate(new Date(LOCALDATE)), UTC);
});

test('utils.setOptions/getOptions', t => {
  const params = {a: 1, b: 'b', c: [1, 2, 3], strictMode: true};
  utils.setOptions(params);
  t.deepEqual(params, utils.getOptions());
  params.strictMode = false;
  t.notDeepEqual(params, utils.getOptions());
  t.is(utils.getOptions().strictMode, true);
});

test('utils.THROW.strictMode', t => {
  const message = 'Error Message';
  utils.setOptions({strictMode: false});
  try {
    utils.THROW({message});
  } catch {
    t.fail();
  }
  utils.setOptions({strictMode: true});
  try {
    utils.THROW({message});
    t.fail();
  } catch (e) {
    t.is(e.message, message);
  }
  t.pass();
});

test('utils.THROW.silent', t => {
  let silent = false;
  const utils = rewire('../../utils');
  const errorHandler = msg => {
    if (silent) {
      t.is(msg, 'end');
    } else {
      t.is(msg, message);
    }
  };
  utils.__set__({
    console: {
      error: errorHandler,
      log: console.log
    }
  });
  const message = 'Error Message';
  utils.setOptions({strictMode: false});
  utils.THROW({message});
  silent = true;
  utils.setOptions({silent});
  utils.THROW({message});
  console.error('end');
  utils.setOptions({strictMode: true});
});
