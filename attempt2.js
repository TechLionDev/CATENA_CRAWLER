const cheerio = require('cheerio');
const fs = require('fs');
const clc = require('cli-color');

// Define custom log functions for different message types
const error = message => console.log(clc.red.bold('(⬣) ' + message));
const info = message => console.log(clc.cyan.bold('(i) ' + message));
const success = message => console.log(clc.green.bold('(✓) ' + message));

// Initialize an empty data array
let data = [];

class Commentary {
    constructor(text, author, source) {
        this.text = text;
        this.author = author;
        this.source = source;
    }
    getText() {
        return this.text;
    }
    getAuthor() {
        return this.author;
    }
    getSource() {
        return this.source;
    }
    setText(text) {
        this.text = text;
    }
    setAuthor(author) {
        this.author = author;
    }
    setSource(source) {
        this.source = source;
    }
}

class CommentaryCrawler {
    commentaryInnerTexts = [];
    commentaries = [];
    async beginCrawl(htmlFile) {
        // Read HTML FILE
        try {
            this.html = fs.readFileSync(htmlFile, 'utf8');
            success('HTML file read successfully.');
        } catch {
            error('Error reading HTML file.');
        }
        // Parse With Cheerio
        try {
            this.$ = cheerio.load(this.html);
            success('HTML file parsed successfully.');
        } catch {
            error('Error parsing HTML file.');
        }
        // Find All Commentaries
        try {
            this.findAllCommentaries();
            success('Commentaries found successfully.');
        } catch {
            error('Error finding commentaries.');
        }
    }
    async findAllCommentaries() {
        let reference = this.$('p.c2 > span.c1').text();
        let chapter = reference.split(':')[0];
        let verse = reference.split(':')[1];
        let commentaryElms = this.$('p.c2');
        commentaryElms.filter((i, elm) => {
            // TODO: Revert to ALL CoMMENTARIES INSTEAD OF JUST 1ST ONE FOR TESTING
            // let commentaryInnerText = elm.children[0].data.replace(/\n\s+/g, ' ');
            // this.commentaryInnerTexts.push(commentaryInnerText);
            let reference
            let referenceElm = this.$(elm).find('span.c1');
            let referenceMatch = /\d+:\d+/;
            let referenceMatches = referenceElm.text().match(referenceMatch);
            console.log(referenceElm.text());
            if (referenceMatches) {
                reference = referenceMatches[0];
            }
            i == 1 && this.commentaryInnerTexts.push({
                commentary: elm.find('span.c0').children[0].data.replace(/\n\s+/g, ' '),
                reference: reference
            });
        });
        await this.parseCommentaries();
    }
    async parseCommentaries() {
        let lastReference
        this.commentaryInnerTexts.forEach((commentaryInnerText, i) => {
            let commentary = new Commentary();
            commentary.setAuthor(commentaryInnerText.commentary.split(':')[0]);
            commentary.setText(commentaryInnerText.commentary.split(':').slice(1).join(':'));
            if (commentaryInnerText.reference) {
                lastReference = commentaryInnerText.reference;
                console.log(lastReference);
            }
            if (commentaryInnerText.commentary.lastReference.split('.')[1])
            commentary.setSource(commentaryInnerText.commentary.lastReference.split('.'));
            console.log(`Chatper: ${lastReference.split(':')[0]} Verse: ${lastReference.split(':')[1]}`);
            console.log(`Source: \n ${commentary.getSource()}`);
            console.log(`Author: \n ${commentary.getAuthor()}`);
            console.log(`Text:  \n ${commentary.getText()}`);
            console.log('-----------------------------------');
            this.commentaries.push(commentary);
        });
    }
}
async function main() {
    let crawler = }

async function main(){
    let crawler = new CommentaryCrawler();
    await crawler.beginCrawl('./HTML/James.docx.html');
}

main();