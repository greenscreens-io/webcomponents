# GSLog class
 
GSLog class is a static generic logging used across the framework. it is a wrapper around browser **console.log** function which allows us a single point of change.
 
If we decide to extend this logging mechanism with other functionalities, such as remote log recording, this is the only place to update. All other classes and components will use the new facility without code modification.


