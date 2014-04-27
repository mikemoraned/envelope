$(function() {
    function load(url) {
        console.log("Loading " + url);

        d3.json(url, function(targets) {
            console.dir(targets);
            function datapointsToPairs(datapoints) {
                function removePairsWithMissingData(pairs) {
                    return _.filter(pairs, function(pair) { return (pair[0] != null) && (pair[1] != null); });
                }

                var values = _.map(datapoints, function(datapoint) { return datapoint[0]; });
                var offsetValues = _.last(values, values.length - 1).concat([null]);
                var pairs = _.zip(values, offsetValues);

                return removePairsWithMissingData(pairs);
            };
            var seriesArray = _.reduce(targets,
                function(array, target){
                    array.push({
                        name: target.target,
                        pairs: datapointsToPairs(target.datapoints)
                    });
                    return array;
                },
                []);
            console.dir(seriesArray);

            function datum(seriesArray) {
                return _.map(seriesArray, function(series) {
                    var group = {
                        key: series.name,
                        values: _.map(series.pairs, function(pair) {
                            return {
                                x: pair[0],
                                y: pair[1]
                            };
                        })
                    };
                    return group;
                });
            };

            nv.addGraph(function() {
                var chart = nv.models.scatterChart()
                    .showDistX(true)
                    .showDistY(true)
                    .color(d3.scale.category10().range());

                chart.xAxis.tickFormat(d3.format('.02f'));
                chart.yAxis.tickFormat(d3.format('.02f'));

                d3.select('#chart svg')
                    .datum(datum(seriesArray))
                    .transition().duration(500)
                    .call(chart);

                nv.utils.windowResize(chart.update);

                return chart;
            });

        });
    };

    var model = {
        url: "http://localhost:8080/render?from=-12hours&until=now&target=sinFunction(\"fake.sin.1\",1)&target=sinFunction(\"fake.sin.2\",2)"
    };
    model.load = function() {
        load(model.url + "&format=json");
    };

    if (window.location.hash) {
        model.url = window.location.hash.substring(1);
    }

    model.load();

    ko.applyBindings(model);
});