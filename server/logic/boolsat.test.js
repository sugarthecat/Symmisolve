import { describe, it } from 'node:test';
import testCNFValidation from './testSuites/testCNFValidation.test.js';
import testCNFParsing from './testSuites/testCNFParsing.test.js';
import testCNFReduction from './testSuites/testCNFReduction.test.js';
import assert from 'node:assert/strict';
import { optimizeCNF, sortClauses, validateSymmetry } from './boolsat.js';

describe('CNF Validation', testCNFValidation);

describe('CNF Parsing', testCNFParsing);

describe('CNF reduction', testCNFReduction);

describe('Symmetry Verification', () => {
    it('should verify symmetry on the PHP', () => {
        assert.equal(
            validateSymmetry(
                sortClauses([
                    [1, 2], [3, 4], [5, 6],
                    [-1, -3], [-3, -5], [-1, -5],
                    [-2, -4], [-2, -6], [-4, -6]]),
                [[1, 3], [2, 4]]
            ),
            true
        )
        assert.equal(
            validateSymmetry(
                sortClauses([
                    [1, 2], [3, 4], [5, 6],
                    [-1, -3], [-3, -5], [-1, -5],
                    [-2, -4], [-2, -6], [-4, -6]]),
                [[1, 2], [3, 4], [5, 6]]
            ),
            true
        )
    })
    it('should correctly handle negative symmetries', () => {
        assert.equal(
            validateSymmetry(
                [[1, -3], [-1, 3]],
                [[1, -3]]
            ),
            true
        )
    })
    it('should return false on dissymmetries on the PHP', () => {
        assert.equal(
            validateSymmetry(
                sortClauses([
                    [1, 2], [3, 4], [5, 6],
                    [-1, -3], [-3, -5], [-1, -5],
                    [-2, -4], [-2, -6], [-4, -6]]),
                [[1, 2]]
            ),
            false
        )
        assert.equal(
            validateSymmetry(
                sortClauses([
                    [1, 2], [3, 4], [5, 6],
                    [-1, -3], [-3, -5], [-1, -5],
                    [-2, -4], [-2, -6], [-4, -6]]),
                [[1, 2], [3, 4]]
            ),
            false
        )
    })
})

describe('Formula Optimization', () => {
    //TODO add symmetry breaking procedures
    it.skip('Should solve the pidgeonhole principle', () => {
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
})
