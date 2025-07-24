import { describe, it } from 'node:test';
import testCNFValidation from './testSuites/testCNFValidation.test.js';
import testCNFParsing from './testSuites/testCNFParsing.test.js';
import testCNFReduction from './testSuites/testCNFReduction.test.js';
import testVerifySymmetry from './testSuites/testVerifySymmetry.test.js';
import assert from 'node:assert/strict';
import { getSizeCNF, optimizeCNF, sortClauses, stringifyCNF, validateSymmetry } from './boolsat.js';
import testVerifyAssignment from './testSuites/testVerifyAssignment.test.js';
import testVerifyConflict from './testSuites/testVerifyConflict.test.js';
import testCNFOptimization from './testSuites/testCNFOptimization.test.js';

describe('CNF Validation', testCNFValidation);

describe('CNF Parsing', testCNFParsing);

describe('CNF Reduction', testCNFReduction);

describe('CNF Optimization', testCNFOptimization);

describe('CNF Symmetry', testVerifySymmetry);

describe('CNF Partial assignment', testVerifyAssignment);

describe('CNF Conflict Verification', testVerifyConflict);

describe('CNF Stringification', () => {
    it('Correctly stringifies CNF formulas', () => {
        assert.equal(
            stringifyCNF(
                []
            ),
            "p cnf 0 0\n"
        )
        assert.equal(
            stringifyCNF(
                [[1]]
            ),
            "p cnf 1 1\n1 0\n"
        )
        assert.equal(
            stringifyCNF(
                [[1,2]]
            ),
            "p cnf 2 1\n1 2 0\n"
        )
        assert.equal(
            stringifyCNF(
                [[1,3]]
            ),
            "p cnf 3 1\n1 3 0\n"
        )
    })
});

describe('CNF Size', () => {
    it('Correctly identifies the size of formulas', () => {
        assert.equal(
            getSizeCNF(
                []
            ),
            0
        )
        assert.equal(
            getSizeCNF(
                [[1]]
            ),
            2
        )
        assert.equal(
            getSizeCNF(
                [[1,2]]
            ),
            3
        )
        assert.equal(
            getSizeCNF(
                [[1,2], [1]]
            ),
            5
        )
    })
});
