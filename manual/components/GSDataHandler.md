# GSDataHandler WebComponent

GSDataHandler WebComponent is a non-UI element for loading external data through reference to [GSReadWrite](../data/GSReadWrite.md).

<br>

## Attributes
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| autoload           | Data will be auto laoded on component init into DOM      |
| autorefresh        | Data auto-refresh in seconds (must be GT 0)              |
| action             | String format for operational mode  (see below)          |
| mode               | Remote call operatoin mode (rest,query,quark)            |
| limit              | Number of records to return                              | 
| skip               | Number fo records to initially skip                      | 
| filter             | JSON filter definition                                   | 
| sort               | JSON sort definition                                     | 
| src                | URL address for remote service for data retrieval        | 
| reader             | Operation for read (GET or quark object path)            | 
| writer             | Operation for write (GET or quark object path)           | 
| type               | Data reader/writer type (default 'remote')               | 

NOTE: Available data handler types: 'remote', 'tree', etc.. Check reders in [Data modules](../../modules/data)

<br>

## Operational modes
---

Operational modes are URL query format definition. 

     * quark - JSON path to CRUD object; ie. io.greenscreens.CRUD
     * rest - url rest format, ie. /${limit}/${skip}?sort=${sort}&filter=${filter}
     * query - url format, ie. ?limit=${limit}&skip=${skip}&sort=${sort}&filter=${filter}

NOTE: When Green Screens Quark engien is used for RPC calls, "src" attribute is ignored.
The whole communication is handled inside Quark Engien defined functions. 

<br>

## Example
---

Example below limits data retrieval to 10 records from URL named in "src" attribute. 
All data responses must return JSON array or HTTP error.

```html
<!-- Default is QUERY mode -->
<gs-data-handler id="handler" src="/data/employees" limit=10></gs-data-handler>
```

Use QUARK engine or any external async function attached to globalThis path

```html
 <gs-data-handler id="handler" mode="quark" reader="io.test.read" writer="io.test.write"></gs-data-handler>
 ```

Use externaly defined GSReadWRite. Can be rpealoaded custom class extending GSAbstractReadWrite.
Custom class must be initialized with id="handler". 

```html
 <gs-data-handler id="handler"></gs-data-handler>
 ```

 <br>

&copy; Green Screens Ltd. 2016 - 2025
