import { it } from "node:test";
import assert from 'node:assert/strict';
import { sortClauses, validateSymmetry } from "../boolsat.js";
const testVerifySymmetry = () => {
    it('Verifies symmetry on the PHP', () => {
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
    it('Correctly handles negative symmetries', () => {
        assert.equal(
            validateSymmetry(
                [[1, -3], [-1, 3]],
                [[1, -3]]
            ),
            true
        )
        assert.equal(
            validateSymmetry(
                [[1, 3]],
                [[1, -3]]
            ),
            false
        )
    })
    it('Returns false on dissymmetries on the PHP', () => {
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
}

export default testVerifySymmetry
