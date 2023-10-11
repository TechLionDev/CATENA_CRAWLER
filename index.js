const cheerio = require('cheerio');
const fs = require('fs');
const clc = require('cli-color');

// Define custom log functions for different message types
const error = message => console.log(clc.red.bold('(⬣) ' + message));
const info = message => console.log(clc.cyan.bold('(i) ' + message));
const success = message => console.log(clc.green.bold('(✓) ' + message));

// Initialize an empty data array
let data = [];

try {
  info('Reading HTML file...');
  // Read the HTML file
  const HTML = fs.readFileSync('./HTML/James.docx.html', 'utf8');
  success('HTML file read successfully.');

  info('Loading HTML content using Cheerio...');
  // Load the HTML content using Cheerio
  const $ = cheerio.load(HTML);
  let reference;

  // Loop through paragraphs with class 'c2'
  $('p.c2').each((i, elem) => {
    info(`Extracting data from paragraph ${i + 1}...`);
    // Extract the reference (e.g., "1:1")
    let referenceElm = $(elem).find('span.c1');
    let referenceMatch = /\d+:\d+/;
    let referenceMatches = referenceElm.text().match(referenceMatch);

    if (referenceMatches) {
      reference = referenceMatches[0];
    }

    // Extract commentary text and source
    let commentaryElm = $(elem).find('span.c0');
    let commentary = commentaryTextToTextAndSource(
      commentaryElm.text().split(':')[1] ? commentaryElm.text().split(':').slice(1).join(':').trim() : ''
    );
    let commentaryAuthor = commentaryElm.text().split(':')[0] ? commentaryElm.text().split(':')[0].trim().replace(/\n\s+/g, ' ') : '';

    // Check if both text and source are not empty
    if (commentary.text !== '') {
      data.push({
        chapter: reference.split(':')[0],
        verse: reference.split(':')[1],
        text: commentary.text.trim(),
        author: commentaryAuthor.trim(),
        source: commentary.source.trim()
      });
      success('Data extracted successfully.');
    } else {
      info('No valid data found in this paragraph.');
    }
  });

  info('Writing the extracted data to a JSON file...');
  // Write the extracted data to a JSON file
  fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
  success('Data extraction and JSON file writing completed successfully!');
} catch (err) {
  error('An error occurred: ' + err.message);
}

function commentaryTextToTextAndSource(text) {
  let commentaryText = text.trim();
  let commentarySource = "";

  // Regular expression pattern to match the source
  var sourcePattern = /([A-Za-z\s]+ \d+\.\d+\.\d+)/; //Maybe make the num.num.num an optinal regex

  // Search for the pattern in the commentary text
  var match = commentaryText.match(sourcePattern);

  // Extract the source if a match is found
  if (match) {
    commentarySource = match[0];
    commentaryText = commentaryText.replace(sourcePattern, '').trim();
  } else {
    // Attempt to extract the source based on context
    var splitText = commentaryText.split('. ');
    if (splitText.length > 1) {
      commentarySource = splitText[splitText.length - 1].trim();
      if (!isNaN(commentarySource) || commentarySource.includes('St')) {
        commentarySource = splitText[splitText.length - 2].trim() + '.' + commentarySource;
      } else if (commentarySource.includes('!')) {
        splitText = commentarySource.split('! ')
        commentarySource = splitText[splitText.length - 1].trim();
      }
    commentaryText = commentaryText.replace(commentarySource, '').trim();
    }
  }

  // Remove excessive newline and whitespace characters
  commentaryText = commentaryText.replace(/\n\s+/g, ' ');

  // Check if the source was extracted using the fallback and ends with a number
  var fallbackSourcePattern = /([A-Za-z\s]+\.\d+)$/;
  if (commentarySource.match(fallbackSourcePattern)) {
    commentarySource = commentarySource.replace(/\.\d+$/, '');
  }
  commentarySource = commentarySource.replace(/\n\s+/g, ' ');
  return { text: commentaryText, source: commentarySource };
}