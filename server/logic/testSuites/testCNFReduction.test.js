import { it } from "node:test";
import assert from 'node:assert/strict';
import { reduceCNF } from "../boolsat.js";

const testCNFReduction = () => {
    it('It should not alter an empty formula, or a false formula', () => {
        assert.deepEqual(reduceCNF([]), [])
        assert.deepEqual(reduceCNF([[]]), [[]])
    })
    it('It should merge any number of resolving clauses', () => {
        assert.deepEqual(reduceCNF([[1],[-1]]), [[]])
        assert.deepEqual(reduceCNF([[1,-2],[1,2],[-1]]), [[]])
        assert.deepEqual(reduceCNF([[1,-2],[1,2],[-1,3],[-1,-3]]), [[]])
        assert.deepEqual(reduceCNF([[1,-2,4],[1,2,4],[1,3,-4],[1,-3,-4]]), [[1]])
        assert.deepEqual(reduceCNF([[-1,2],[-2,3],[1,-3],[1,2,3],[-1,-2,-3]]), [[]])
    })
    it('It should be able to remove duplicates', () => {
        assert.deepEqual(reduceCNF([[1],[1],[1],[1]]),[[1]])
    })
    it('It should be able to remove subclauses', () => {
        assert.deepEqual(reduceCNF([[1],[1,2,3],[1,4,2],[1,4,6]]), [[1]])
        assert.deepEqual(reduceCNF([[1,2,3],[1,4,2],[1],[1,4,6]]), [[1]])
    })
}
export default testCNFReduction
