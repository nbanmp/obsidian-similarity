import spacy
import sys
import json

# Next step, always have this process open & communicate via stdin.
nlp = spacy.load("en_core_web_lg")


def similarity(a, b):
    # Load English tokenizer, tagger, parser, NER and word vectors

    # Process whole documents
    doc_a = nlp(a)
    doc_b = nlp(b)

    return doc_a.similarity(doc_b)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Error!")
        exit(0)

    payload = json.loads(sys.argv[1])

    currFileText = payload["allNotes"][payload["currNote"]]
    compareFileText = payload["allNotes"]["profitvsgood.md"]

    similarities = []
    for noteName, noteText in payload["allNotes"].items():
        sim = similarity(currFileText, noteText)
        similarities.append((noteName, sim))

    similarities = sorted(similarities, key=lambda tup: tup[1], reverse=True)

    print(json.dumps(similarities))
