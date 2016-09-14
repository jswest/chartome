# Chartome

----

A tool to build charts with [Electome](http://www.electome.org) data.

----

## Usage notes // gotchas

#### CSV
Before you can do anything else, you need to upload a CSV file. It's best if the CSV is in the format that you download from the electome; that is, it needs a column called "date", and it needs to be broken out by day. It should look something like this if you open it up in a text editor:
```
date,racial issues,economy
2016-08-01,0.5,0.25
2016-08-02,0.75,0.12
...
```
#### Text
You can remove draggable text—interest point text and labels—by dragging it off screen. But be careful! It's hard to get it back. For axis text, you can remove by double-clicking it. Double-clicking it a second time on where the text used to be should return it to life.

#### Interest points
Adjust the location of the interest point parts by dragging. For the line, you'll need to drag the handles on either end of the line. You can turn off the handles for the interest point lines by clicking on the dot to the right of the interest point input field. Clicking on that dot again will bring them back so you can contintue to move them around. You should remove the handles before you export.

#### Saving
This _has_ to be the last step. If you save once, you can't save again, and you can't re-edit the chart.

#### Back button
Don't use it. Reload the page instead.

----

## Locale usage
1. ~~Download and install [Merriweather Sans](https://www.fontsquirrel.com/fonts/merriweather-sans) and [Montserrat](https://www.fontsquirrel.com/fonts/montserrat). It is essentiaål that you do this for the charts to look right.~~
2. Fire up a server
3. Navigate to `localhost` on the correct port.
4. Upload a CSV file and have some fun.

----

## Todos
### Bugs
- When you save a chart, you can no longer edit that chart.
- When you save a chart, the scroll on the right- and bottom-sides goes nuts.
- It appears that the days are slightly misaligned on line charts but not area charts.
- When you change the aspect ratio, all kinds of odd things happen.

### Features
- Add bar charts.
- Add pie charts.
- ~~Base64-encode the fonts (or whatever is necessary) to get them to work without being locally installed.~~
