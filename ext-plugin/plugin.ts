"use strict";
import * as cp from "child_process";

function main(arg:string) {
    const txt:string = arg;
    const txtArr:string[]|null = modifyCommentedText(txt);
    if (txtArr != null) {
        const textToBeSearched:string = txtArr[0];
        const commentBegin:string  = txtArr[1];
        const commentEnd:string = txtArr[2];

        spawnChild(textToBeSearched, function(myArr:string[]) {
            howdoiResult(myArr,txt, commentBegin, commentEnd);
        });
    }   
}

async function spawnChild(command:string, callback:any) {
    const updatedCommand = howdoiPrefix(command);
    const process = await cp.spawn("howdoi", [updatedCommand, '-n 3']);
    let result:string[] = [];
    process.stdout.on("data", (data:any) => {
        result.push(String(data));
    });

    process.stderr.on("data", (data:any) => {
        console.log(`stderr: ${data}`);
    });
    
    process.on('error', (error:any) => {
        console.log(`error: ${error.message}`);
    });
    
    process.on("close", (code:any) => {
        console.log(`child process exited with code ${code}`);
        callback(result);
    });
}

// removes howdoi from command
function howdoiPrefix(command:string) {
    const prefix = "howdoi";
    
    if (command.includes(prefix)) {
        const newCommand = command.replace(prefix,'');
        return newCommand;
    }
    else {
        return command;
    }
}

//  only for single line comments
function modifyCommentedText(textToBeModified:string) {
    const regexBegins:RegExp =  /^[!@#<>/\$%\^\&*\)\(+=._-]+/;
    const regexEnds:RegExp = /[!@#<>/\$%\^\&*\)\(+=._-]+$/;
    let commentBegin:string;
    let commentEnd:string;	
        
    if (textToBeModified.match(regexBegins) && textToBeModified.match(regexEnds)){
        commentBegin = textToBeModified.match(regexBegins)!.join();
        commentEnd = textToBeModified.match(regexEnds)!.join();
        textToBeModified = textToBeModified.replace(regexBegins, '');
        textToBeModified = textToBeModified.replace(regexEnds, '');
        let result:string[]  = [textToBeModified, commentBegin, commentEnd];
        return result;
    }
    else if(textToBeModified.match(regexEnds)){
        commentEnd = textToBeModified.match(regexEnds)!.join();
        textToBeModified = textToBeModified.replace(regexEnds, '');
        let result:string[] = [textToBeModified,'',commentEnd];
        return result;
    }
    else if(textToBeModified.match(regexBegins)){
        commentBegin = textToBeModified.match(regexBegins)!.join();
        textToBeModified = textToBeModified.replace(regexBegins, '');
        let result:string[] = [textToBeModified, commentBegin, ''];
        return result;
    }
    else {
        return null;
    }
}

function spliceArr(obj:string[], commentBegin:string, commentEnd:string) {
    let dataString = String(obj);
    let lines = dataString.split('\n'+'================================================================================' + '\n' + '\n');
    let newArr:string[][] = lines.map((elem) => elem.split(' ★'));
    for (let i = 0; i < newArr.length; i++) {
        newArr[i][0] = commentBegin + newArr[i][0] + commentEnd;
    }
    return newArr;
}

function howdoiResult(resultArr:string[],userTxt:string, commentBegin:string, commentEnd:string) {
    const newResult:string[][] = spliceArr(resultArr,commentBegin,commentEnd);
    return newResult;
}

    

