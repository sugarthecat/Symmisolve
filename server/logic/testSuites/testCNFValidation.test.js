import { it } from "node:test";
import assert from 'node:assert/strict';
import { validateCNF } from "../boolsat.js";

const testCNFValidation = () => {
    it('Is false on an empty string, or a string without a header', () => {
        assert.equal(validateCNF(''), false);
        assert.equal(validateCNF('c hey! this is a comment'), false);
        assert.equal(validateCNF('c hey! this is a comment'), false);
        assert.equal(validateCNF('c hey! this is a comment\nc a multiple line comment :)'), false);
    })
    it('Is true on a valid CNF formula', () => {
        assert.equal(validateCNF('p cnf 2 3\n1 2 0\n1 -2 0\n-1 0'), true);
    })
    it('Is true on a valid CNF formula with a comments', () => {
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
    it('Allows arbitrary extra spaces', () => {
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "c with a comment\n" +
            "c and another comment\n" +
            "p cnf 5 3\n" +
            "1  2   0\n" +
            "1  -2  0\n" +
            "-1     0"
        ), true);
    })
    it('Is true on a benchmark problem', () => {
        assert.equal(validateCNF(
            "c SAT instance in DIMACS CNF input format .\n" +
            "c \n" +
            "p cnf 100 40\n" +
            "8  -9  54  0\n" +
            "-48  61  -97  0\n"
        ), true);
    })
    it('Allows the overcounting of variables', () => {
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
    it('Does not allow the undercounting of variables', () => {
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
    it('Allows the overcounting of clauses', () => {
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 4\n" +
            "1 2 0\n" +
            "3 -4 0\n" +
            "-3 0"
        ), true);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 2\n" +
            "1 2 0\n"
        ), true);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 3\n" +
            "1 2 0\n" +
            "2 -3 0\n"
        ), true);
    })
    it('Allows the undercounting of clauses', () => {
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 2\n" +
            "1 2 0\n" +
            "3 -4 0\n" +
            "-3 0"
        ), true);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 1\n" +
            "1 2 0\n" +
            "3 4 0\n" +
            "-3 -4 0\n"
        ), true);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 1\n" +
            "1 2 0\n" +
            "2 -3 0\n"
        ), true);
    })
    it('Allows tabs instead of spaces', () => {
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p\tcnf\t4\t3\n" +
            "1\t2\t0\n" +
            "3\t-4\t0\n" +
            "-3\t0"
        ), true);
        assert.equal(validateCNF(
            "c this is a basic formula\n" +
            "p cnf 4 3\n" +
            "1\t2\t0\n" +
            "3\t4\t0\n" +
            "-3\t-4\t0\n"
        ), true);
        assert.equal(validateCNF(
            "c\tthis is a basic formula\n" +
            "p\tcnf\t4\t2\n" +
            "1 2 0\n" +
            "2 -3 0\n"
        ), true);
    })
    it('Skips non-numeric variables', () => {
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
    it('Ignores empty lines', () => {
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
}
export default testCNFValidation
