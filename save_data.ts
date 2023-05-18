import fs from 'fs';

export default function saveData(results: Array<any>, date: string, time: string, id: number) {

    /**
     * Utility to format array to suit our esthetic needs
     */
    function formatString(inputString: string) {
        const a = inputString.slice(1);
        const b = a.slice(0, -1); 
        const formatted = b.concat('\n');
        return formatted;
    }

    /**
     * Formats results array and stores it in the variable named data
     */
    const data = formatString(JSON.stringify(Object.values(results[id])).replace(/"/g,'').replace(/,/g,' || '));

    /**
     * Creates a file in the current directory to save the data if the file hasn't been created yet and
     * Stores each element of results in its own row in the created file
     */
    fs.appendFile(`Logs from ${date} ${time}.txt`, data, function (err) {
        if (err) throw err;
        });
}
