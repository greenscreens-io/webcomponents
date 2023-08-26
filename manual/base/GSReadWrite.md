# GSReadWrite class
 
GSReadWrite class is an abstract generic class for data rad/write from forms and table stores.
To use it with GSFormExt or GSStore, create your own class extending GSReadWrite and override "onRead" and "onWrite" methods. 


NOTE: Please see [Install](../install.md) document for instructions on how to generate API manuals.
 
 ## Usage 

 ```JavaScript
 export default class MyStore extends GSReadWrite {

    async onRead(owner) {
        // TODO read the data fro mthe server
    }
    
    async onWrite(owner, data) {
        // TODO store the data to the server
    }
 }
 ```