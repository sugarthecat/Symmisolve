const { optimizeCNF, parseCNF, getSizeCNF, CURR_ALGO_VER } = require("../logic/boolsat.js");
const fs = require("fs");
const path = require("path");

const BENCHMARK_INPUT_DIR = path.join(__dirname, "benchmark-problems");
const BENCHMARK_OUTPUT_DIR = path.join(__dirname, "benchmark-results");

const data = [];
function runBenchmarkOn(problem, file, directory) {
    let benchmarkTime = Date.now();
    const prevSize = getSizeCNF(problem);
    const optimized = optimizeCNF(problem);
    const newSize = getSizeCNF(optimized);
    benchmarkTime = Date.now() - benchmarkTime;
    data.push({ prevSize, newSize, benchmarkTime, file, pset:directory, algoVer: CURR_ALGO_VER });
    console.log(`${file}, ${prevSize} -> ${newSize} (${benchmarkTime}ms)`);
}

function runBenchmarkOnPset(pset) {
    console.log("\n-----------  Running benchmark on " + pset + "  -----------\n");
    const BENCHMARK_PSET = path.join(BENCHMARK_INPUT_DIR, pset);
    return new Promise (resolve => {
        fs.readdir(BENCHMARK_PSET, (err, probFiles) => {
            probFiles.forEach((file) => {
                if (!file.endsWith(".cnf")) return;
                try {
                    const data = fs.readFileSync(path.join(BENCHMARK_PSET, file), "utf8");
                    const cnf = parseCNF(data);
                    runBenchmarkOn(cnf, file, pset);
                    resolve();
                } catch (err) {
                    console.error(err);
                }
            });
        });
    })
}

fs.readdir(BENCHMARK_INPUT_DIR, async (err, psetFiles) => {
    //find directories in benchmark-problems
    for(const psetFile of psetFiles) {
        if (fs.lstatSync(path.join(BENCHMARK_INPUT_DIR, psetFile)).isDirectory()) {
            //for each director, find files with .cnf extension
            await runBenchmarkOnPset(psetFile);
        }
    }
    //write results to file
    //make data into a csv
    let csv = "prevSize,newSize,benchmarkTime,file,pset,algoVer\n";
    for(const row of data) {
        csv += `${row.prevSize},${row.newSize},${row.benchmarkTime},${row.file},${row.pset},${row.algoVer}\n`;
    }
    let now = new Date();
    fs.writeFileSync(path.join(BENCHMARK_OUTPUT_DIR, `bench-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}:${now.getMinutes()}.csv`), csv, "utf8");
});
