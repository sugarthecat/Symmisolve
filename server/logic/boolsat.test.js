import { describe, it } from 'node:test';
import testCNFValidation from './testSuites/testCNFValidation.test.js';
import testCNFParsing from './testSuites/testCNFParsing.test.js';
import testCNFReduction from './testSuites/testCNFReduction.test.js';
import assert from 'node:assert/strict';
import { sortClauses, validateSymmetry } from './boolsat.js';

describe('CNF Validation', testCNFValidation);

describe('CNF Parsing', testCNFParsing);

describe('CNF reduction & optimization', testCNFReduction);

describe('Symmetry Verification', () => {
    it('should verify symmetry on the PHP', () => {
        assert.equal(
            validateSymmetry(
                sortClauses([
                    [1, 2], [3, 4], [5, 6],
                    [-1, -3], [-3, -5], [-1, -5],
                    [-2, -4], [-2, -6], [-4, -6]]),
                    [[1,3],[2,4]]
            ),
            true
        )
        assert.equal(
            validateSymmetry(
                sortClauses([
                    [1, 2], [3, 4], [5, 6],
                    [-1, -3], [-3, -5], [-1, -5],
                    [-2, -4], [-2, -6], [-4, -6]]),
                    [[1,2],[3,4],[5,6]]
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
                    [[1,2]]
            ),
            false
        )
        assert.equal(
            validateSymmetry(
                sortClauses([
                    [1, 2], [3, 4], [5, 6],
                    [-1, -3], [-3, -5], [-1, -5],
                    [-2, -4], [-2, -6], [-4, -6]]),
                    [[1,2],[3,4]]
            ),
            false
        )
    })
})
