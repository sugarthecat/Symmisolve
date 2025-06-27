import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseCNF, validateCNF } from './boolsat.js';

describe('CNF Validation', () => {
    it('should be false on an empty string, or a string without a header', () => {
        assert.equal(validateCNF(''), false);
        assert.equal(validateCNF('c hey! this is a comment'), false);
        assert.equal(validateCNF('c hey! this is a comment'), false);
        assert.equal(validateCNF('c hey! this is a comment\nc a multiple line comment :)'), false);
    })
    it('should be true on a valid CNF formula', () => {
        assert.equal(validateCNF('p cnf 2 3\n1 2 0\n1 -2 0\n-1 0'), true);
    })
    it('should be true on a valid CNF formula with a commen/s', () => {
        assert.equal(validateCNF('c this is a basic formula \np cnf 2 3\n1 2 0\n1 -2 0\n-1 0'), true);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "c with a comment\n" +
            "c and another comment\n" +
            "p cnf 2 3\n" +
            "1 2 0\n" +
            "1 -2 0\n" +
            "-1 0"
        ), true);
    })
    it('Should allow the overcounting of variables', () => {
        assert.equal(validateCNF('c this is a basic formula \np cnf 3 3\n1 2 0\n1 -2 0\n-1 0'), true);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "c with a comment\n" +
            "c and another comment\n" +
            "p cnf 5 3\n" +
            "1 2 0\n" +
            "1 -2 0\n" +
            "-1 0"
        ), true);
    })
    it('Should not allow the overcounting of variables', () => {
        assert.equal(validateCNF('c this is a basic formula \np cnf 1 3\n1 2 0\n1 -2 0\n-1 0'), false);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "c with a comment\n" +
            "c and another comment\n" +
            "p cnf 2 3\n" +
            "1 2 0\n" +
            "3 -4 0\n" +
            "-3 0"
        ), false);
    })
    it('Should not allow the overcounting of clauses', () => {
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 4\n" +
            "1 2 0\n" +
            "3 -4 0\n" +
            "-3 0"
        ), false);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 2\n" +
            "1 2 0\n"
        ), false);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 3\n" +
            "1 2 0\n"+
            "2 -3 0\n"
        ), false);
    })
    it('Should not allow the undercounting of clauses', () => {
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 2\n" +
            "1 2 0\n" +
            "3 -4 0\n" +
            "-3 0"
        ), false);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 1\n" +
            "1 2 0\n"+
            "3 4 0\n"+
            "-3 -4 0\n"
        ), false);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 1\n" +
            "1 2 0\n"+
            "2 -3 0\n"
        ), false);
    })
    it('Should not allow non-numeric of variables', () => {
        assert.equal(validateCNF('c this is a basic formula \np cnf 1 3\nb ao 0\n1 -2 0\n-1 0'), false);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "c with a comment\n" +
            "c and another comment\n" +
            "p cnf 2 3\n" +
            "1 2 0\n" +
            "3 a 0\n" +
            "-3 0"
        ), false);
    })
    it('Should ignore empty lines', () => {
        assert.equal(validateCNF('c this is a basic formula \np cnf 1 3\nb ao 0\n1 -2 0\n-1 0'), false);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "c with a comment\n\n" +
            "c and another comment\n" +
            "p cnf 2 3\n" +
            "1 2 0\n\n" +
            "3 a 0\n" +
            "-3 0\n\n"
        ), false);
    })
});

describe('CNF Parsing', () => {
    it('It should throw an error on an invalid CNF', () => {
        assert.throws( () => {parseCNF('')});
        assert.throws( () => {parseCNF('c hey! this is a comment')});
        assert.throws( () => {parseCNF('c hey! this is a comment\nc a multiple line comment :)')});
        assert.throws( () => {parseCNF('p cnf 1 3\n1 2 0\n1 -2 0\n-1 0')});
        assert.throws( () => {parseCNF('p cnf 2 2\n1 2 0\n1 -2 0\n-1 0')});
        assert.throws( () => {parseCNF('p cnf 2 4\n1 2 0\n1 -2 0\n-1 0')});
    })
    it('It should parse formulas correctly', () => {
        assert.deepEqual(parseCNF('p cnf 2 3\n1 2 0\n1 -2 0\n-1 0'), [[1,2],[1,-2],[-1]]);
        assert.deepEqual(parseCNF('p cnf 1 2\n1 0\n-1 0'), [[1],[-1]]);
    })
    it('It should handle large cases well', () => {
        assert.deepEqual(
            parseCNF(
                'c Pidgeonhole Principle (2 pidgeons, 3 holes)\n' +
                'p cnf 6 9\n' +
                '1 2 0\n' +
                '3 4 0\n' +
                '5 6 0\n' +
                '-1 -3 0\n' +
                '-1 -5 0\n' +
                '-3 -5 0\n'+
                '-2 -4 0\n' +
                '-2 -6 0\n' +
                '-4 -6 0\n'
            ),
         [[1,2],[3,4],[5,6],[-1,-3],[-1,-5],[-3,-5],[-2,-4],[-2,-6],[-4,-6]]);
    })

});
