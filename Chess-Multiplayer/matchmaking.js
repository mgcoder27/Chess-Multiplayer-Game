function createMatchmaker(timeControls = ['10', '15', '20']) {
    const waiting = new Map(timeControls.map((time) => [time, []]));

    return {
        addPlayer(playerId, time) {
            const queue = waiting.get(time);
            if (!queue) {
                return null;
            }

            if ([...waiting.values()].some((players) => players.includes(playerId))) {
                return { status: 'waiting' };
            }

            if (queue.length > 0) {
                const opponentId = queue.shift();
                return {
                    status: 'matched',
                    whiteId: playerId,
                    blackId: opponentId,
                    time
                };
            }

            queue.push(playerId);
            return { status: 'waiting' };
        },

        removePlayer(playerId) {
            for (const queue of waiting.values()) {
                const index = queue.indexOf(playerId);
                if (index !== -1) {
                    queue.splice(index, 1);
                    return;
                }
            }
        },

        getWaitingCount(time) {
            return waiting.get(time)?.length ?? 0;
        }
    };
}

module.exports = { createMatchmaker };
