import { it } from "node:test";
import assert from 'node:assert/strict';
import { isSubclause, reduceCNF } from "../boolsat.js";

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
    it('It should sort clauses lexically', () => {
        assert.deepEqual(reduceCNF([[-1,-2],[1,2]]), [[1,2],[-1,-2]])
        assert.deepEqual(reduceCNF([[9],[2],[-3],[4],[-5],[7,-1]]), [[-1,7],[2],[-3],[4],[-5],[9]])
        assert.deepEqual(reduceCNF([[-1,-7],[-1,5],[-1,6],[1]]), [[1],[5],[6],[-7]])
    })
    it('It should remove tautological clauses', () => {
        assert.deepEqual(reduceCNF([[-1,1]]), [])
        assert.deepEqual(reduceCNF([[12,3,9,-1,23,1,2],[7]]), [[7]])
    })
    it('It should detect subclauses', () => {
        assert.equal(isSubclause([1,2,3],[1,2]), true)
        assert.equal(isSubclause([1,2],[1,2]), false)
        assert.equal(isSubclause([1,2],[1,2,3]), false)
        assert.equal(isSubclause([1,2,3],[1]), true)
        assert.equal(isSubclause([1,2,3],[]), true)
    })
}
export default testCNFReduction
