let TIME_TRACKER_ICON = 'https://cdn.glitch.global/6fa928dc-895c-4789-a1c9-810dae006465/timeTracker.png?v=1668063599843';

TrelloPowerUp.initialize({
    // Start adding handlers for your capabilities here!
    'card-buttons': function(t, options) {
        return [
            {
                icon: TIME_TRACKER_ICON,
                text: 'HTML View (Time Tracker)',
                callback: function(t) {
                    return t.modal({
                        title: "HTML View (Time Tracker)",
                        url: './modal.html',
                        height: 450,
                        accentColor: '#F2D600',
                        callback: () => console.log('Goodbye.'),   
                    })
                }
            },
        ];
    },
    'card-badges': function(t, options) {
        return t.getAll('card', 'shared')
        .then(function(sharedDate){
            if(Object.keys(sharedDate).length < 1) {
                return [];
            }
            let {card: {shared: {stopTime, startTime, totalTime}}} = sharedDate;
            let color = 'red';
            let text = '⧖ No Time Tracked';
            if(startTime && stopTime) {
                color = 'green';
                text = `⧗ ${totalTime}`;
            }else if(startTime) {
                color = 'yellow';
                text = '⏳ Tracking Time';
            }
            return [{
                text,
                color
            }];
        })
    },
    "card-detail-badges": function(t, options) {
        return t.getAll('card', 'shared')
        .then(function(sharedDate){
            if(Object.keys(sharedDate).length < 1) {
                return [];
            }
            let {card: {shared: {fullTimeOnCard}}} = sharedDate;
            let title = "Total Time:";
            let color = 'orange';
            let fullTime = fullTimeOnCard ? fullTimeOnCard : "00 : 00 : 00";
            let text = fullTime;
            return [{
                title,
                text,
                color
            }];
        })
    }
});