# GSDate class
 
GSDate class is extended version of standard JavaScript Date with additionl features such as formating, calendar creation helper functions etc.

When formating date, use following table as a reference for supported mappings.

| Format	| Output	        | Description                                   |
|-----------|-------------------|-----------------------------------------------|
| YY        | 18	            | Two-digit year                                |
| YYYY      | 2018	            | Four-digit year                               |
| M         | 1-12	            | The month, beginning at 1                     |
| MM        | 01-12	            | The month, 2-digits                           |
| MMM       | Jan-Dec           | The abbreviated month name                    |
| MMMM      | January-December	| The full month name                           |
| D         | 1-31	            | The day of the month                          |
| DD        | 01-31	            | The day of the month, 2-digits                |
| d         | 0-6	            | The day of the week, with Sunday as 0         |
| dd        | Su-Sa	            | The min name of the day of the week           |
| ddd       | Sun-Sat           | The short name of the day of the week         |
| dddd      | Sunday-Saturday	| The name of the day of the week               |
| H         | 0-23	            | The hour                                      |
| HH        | 00-23	            | The hour, 2-digits                            |
| h         | 1-12	            | The hour, 12-hour clock                       |
| hh        | 01-12	            | The hour, 12-hour clock, 2-digits             |
| m         | 0-59	            | The minute                                    |
| mm        | 00-59	            | The minute, 2-digits                          |
| s         | 0-59	            | The second                                    |
| ss        | 00-59	            | The second, 2-digits                          |
| SSS       | 000-999	        | The millisecond, 3-digits                     |
| Z         | +05:00	        | The offset from UTC, ±HH:mm                   |
| ZZ        | +0500	            | The offset from UTC, ±HHmm                    |
| A         | AM PM             | 	                                            |
| a         | am pm	            |                                               |

| Q         | 1-4	            | Quarter of the year                           |
| W         | 1-53	            | ISO Week of the year                          |
| WW        | 01-53	            | ISO Week of the year, 2-digits                |
| k         | 1-24	            | The hour, beginning at 1                      |
| kk        | 01-24	            | The hour, beginning at 1, 2-digits            |
| x         | 1360013296123     | Unix Timestamp in second                      |
| X         | 1360013296	    | Unix Timestamp in millisecond                 |

## Example
---

```js
const d = new GSDate();

// use browser default locale
console.log(d.format('HH:mm:ss DD.MM.YYYY'));

// use Croatian language locale
console.log(d.format('HH:mm:ss DD.MM.YYYY', 'hr-HR'));

// convert all formats to JSON object
console.log(d.asJSON());

// get day and month list in browser default locale
console.log(GSDate.dayList());
console.log(GSDate.monthList());

// get day and month list in requested locale
console.log(GSDate.dayList('hr-HR'));
console.log(GSDate.monthList('hr-HR'));
```
<br>

&copy; Green Screens Ltd. 2016 - 2025
