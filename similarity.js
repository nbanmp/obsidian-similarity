const spawn = require("child_process").spawn;
const promisify = require("util").promisify
const readFile = promisify(require("fs").readFile);

function similarity(currNote, allNotes, callback) {
    payload = JSON.stringify({
        "currNote": currNote,
        "allNotes": allNotes
    })
    const pythonProcess = spawn('/usr/bin/python3',[__dirname + "/similarity.py", payload]);
    pythonProcess.stdout.on('data', (data) => {
        //console.log(data.toString('utf8'))
        callback(JSON.parse(data.toString('utf8')));
    });
    pythonProcess.stderr.on('data', (data) => {
        callback(data.toString('utf8'));
    });
}

class TestView {
	constructor(whoknowswhat) {
        this.whoknowswhat = whoknowswhat
        console.log(whoknowswhat)
    }

    getDisplayText = () => {
            return "Display Text"
    }

    getViewType = () => {
            return "yeet"
    }
}


class TestPlugin {
	constructor() {
		this.id = 'test'
		this.name = 'Test plugin'
		this.description = 'Test plugin to demo Volcano.'
		this.defaultOn = true // Whether or not to enable the plugin on load
	}
	
	init(app, instance) {
		console.log('Plugin is initializing!')
        this.app = app
        this.instance = instance 

        console.log(this.instance);

        this.instance.registerRibbonAction('Test ribbon', 'dice', () => this.trigger())

        //this.instance.registerViewType("yeet", (a) => {
        //    return new TestView(a)
        //})
	}

    async trigger() {
        this.leaf.view.infinityScroll.clear();
        let el = createEl('div', {cls: 'tag-pane-tag-text', text: 'Loading...'});
        this.leaf.view.infinityScroll.append(el);

        let fileData = {}
        for(const [path, obj] of Object.entries(this.app.vault.fileMap)) {
            if(obj.extension == "md") {
                fileData[path] = await readFile(this.app.vault.adapter.basePath + "/" + path, "utf8");
            }
        }

        let currentFile = this.app.workspace.lastOpenFiles[0] // TODO: Is there a more accurate way? What if two files are open?
        let currentFileText = await readFile(this.app.vault.adapter.basePath + "/" + currentFile, "utf8");

        similarity(currentFile, fileData, (data) => {
            // console.log(data);
            this.leaf.view.infinityScroll.clear();
            for(const tup of data) {
                let el = createEl('div', {cls: 'tag-pane-tag pane-clickable-item list-item', text: tup[0] + ' - ' + tup[1].toString()});
                el.addEventListener('click', () => {
                    this.app.workspace.getLeaf().openFile(app.vault.fileMap[tup[0]])
                })
                this.leaf.view.infinityScroll.append(el);
            }
        })
    }

	async onEnable(app, instance) {
        if(this.app.workspace.getLeavesOfType("tag").length !== 2) {
            this.leaf = this.app.workspace.getRightLeaf(0)
        } else {
            this.leaf = this.app.workspace.getLeavesOfType("tag")[1];
        }

        await this.leaf.setViewState({ type: "tag" })

        this.trigger()
	}
}

module.exports = () => new TestPlugin()
