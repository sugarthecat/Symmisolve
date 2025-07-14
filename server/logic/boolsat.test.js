import { describe, it } from 'node:test';
import testCNFValidation from './testSuites/testCNFValidation.test.js';
import testCNFParsing from './testSuites/testCNFParsing.test.js';
import testCNFReduction from './testSuites/testCNFReduction.test.js';
import testVerifySymmetry from './testSuites/testVerifySymmetry.test.js';
import assert from 'node:assert/strict';
import { getSizeCNF, optimizeCNF, sortClauses, stringifyCNF, validateSymmetry } from './boolsat.js';
import testVerifyAssignment from './testSuites/testVerifyAssignment.test.js';
import testVerifyConflict from './testSuites/testVerifyConflict.test.js';

describe('CNF Validation', testCNFValidation);

describe('CNF Parsing', testCNFParsing);

describe('CNF Reduction', testCNFReduction);

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

describe('Formula Optimization', () => {
    //TODO add symmetry breaking procedures
    it.skip('Solves the pidgeonhole principle', () => {
        //pidgeonhole principle of 3 pidgeons in 2 holes
        assert.deepEqual(
            optimizeCNF([
                [1, 2],
                [3, 4],
                [5, 6],
                [-1, -3],
                [-1, -5],
                [-3, -5],
                [-2, -4],
                [-2, -6],
                [-4, -6]]
            ),
            [[]]
        )
        //pidgeonhole principle of 4 pidgeons in 3 holes
        assert.deepEqual(
            optimizeCNF([
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
                [10, 11, 12],
                [-1, -4],
                [-1, -7],
                [-1, -10],
                [-4, -7],
                [-4, -10],
                [-7, -10],
                [-2, -5],
                [-2, -8],
                [-2, -11],
                [-5, -8],
                [-5, -11],
                [-8, -11],
                [-3, -6],
                [-3, -9],
                [-3, -12],
                [-6, -9],
                [-6, -12],
                [-9, -12]]
            ),
            [[]]
        )
    })
    it.skip('Solves Transitivity problems', () => {
        //a = b, b = c, a != c has a contradiction
        assert.deepEqual(
            optimizeCNF([
                [1, -2],
                [-1,2],
                [2, -3],
                [-2,3],
                [1, 3],
                [-1,-3],
            ]),
            [[]]
        )
        //a != b, b != c, a != c has a contradiction
        assert.deepEqual(
            optimizeCNF([
                [1, 2],
                [-1,-2],
                [2, 3],
                [-2,-3],
                [1, 3],
                [-1,-3],
            ]),
            [[]]
        )
    })
})
