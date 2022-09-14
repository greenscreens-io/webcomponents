# GSStore WebComponent

GSStore WebComponent is a non-UI element for loading external data, paging data and limiting data view.

Events fired from this component are used by [GSTable](GSTable.md) to refresh its UI.

Every ```<gs-item>``` child element represents loaded record column which name is mapped to a data column name.

<br>

## Attributes
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| mode               | Remote call operatoin mode (rest,query,quark)            |
| action             | Strign format for operational mode  (see below)          |
| src                | URL address for remote service for data retrieval        | 
| limit              | Number of records to return                              | 
| skip               | Number fo records to initially skip                      | 


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
<gs-store src="/data/employees" id="employees" limit=10>
    <gs-item name="Age" type="number"></gs-item>
    <gs-item name="Salary" type="number" format="$\d"></gs-item>
    <gs-item name="Start date" type="date" format="yyyy/mm/dd"></gs-item>
</gs-store>
```
