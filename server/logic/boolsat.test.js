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
    it('Should take immediate resolution-rule steps', () => {
        //3-dimensional non-merge problem
        assert.deepEqual(
            optimizeCNF(
                [1, 2, 3],
                [-1, -2, -3],
                [1, -2],
                [2, -3],
                [3, -1]
            ),
            [[]]
        )
        assert.deepEqual(
            optimizeCNF(
                [1, 2, 3, 4],
                [-1, -2, -3],
                [1, -2, 4],
                [1, 3, -4],
                [2, -3],
                [3, -1]
            ),
            [[]]
        )
    })
    it('Should solve basic sorting problems', () => {

        //say we have 3 positions, and 2 items
        //Should resolve to unsatisfiability since they both need to be before each other
        assert.deepEqual(
            optimizeCNF(
                [
                    //item 1 must be placed
                    [1, 2, 3],
                    //item 1 is only in one spot
                    [-1, -2],
                    [-1, -3],
                    [-2, -3],
                    //item 2 must be placed
                    [4, 5, 6],
                    //item 2 is only in one spot
                    [-4, -5],
                    [-4, -6],
                    [-5, -6],
                    //item 1 and item 2 cannot share a spot
                    [-1, -4],
                    [-2, -5],
                    [-3, -6],
                    //Item 1 must be after item 2
                    [-3, 4, 5], //if item 1 is in position 3, item 2 must be in position 1 or 2
                    [-2, 4], //if item 1 is in position 2, item 2 must be in position 1
                    [-1], //if item 1 is in position 1, nothing is possible
                    //Item 2 must be after item 1
                    [-6, 1, 2], //if item 2 is in position 3, item 1 must be in position 1 or 2
                    [-5, 1], //if item 2 is in position 2, item 1 must be in position 1
                    [-4], //if item 1 is in position 1, nothing is possible
                ]
            ),
            [[]]
        )
        //2 positions, 2 items, a must be before b
        assert.deepEqual(
            optimizeCNF(
                [
                    //item 1 must be placed
                    [1, 2],
                    //item 2 must be placed
                    [3, 4],
                    //item 1 and item 2 cannot share a spot
                    [-1, -3],
                    [-2, -4],
                    //Item 1 must be after item 2
                    [-1, 4], //item 1 in position 1 implies item 2 in position 2
                    [-2], //item 1 can't be in position 2
                ]
            ),
            [[1], [-2], [-3], [4]]
        )
    })
    it('Should solve the pidgeonhole principle', () => {
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


console.log(
    optimizeCNF(
        [
            //item 1 must be placed
            [1, 2],
            //item 2 must be placed
            [3, 4],
            //item 1 and item 2 cannot share a spot
            [-1, -3],
            [-2, -4],
            //Item 1 must be after item 2
            [-1, 4], //item 1 in position 1 implies item 2 in position 2
            [-2], //item 1 can't be in position 2
        ]
    )
)
