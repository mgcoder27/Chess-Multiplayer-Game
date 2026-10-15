const { createMatchmaker } = require('./matchmaking');

describe('createMatchmaker', () => {
    test('puts the first player in the waiting queue', () => {
        const matchmaker = createMatchmaker();

        expect(matchmaker.addPlayer('player-1', '10')).toEqual({ status: 'waiting' });
        expect(matchmaker.getWaitingCount('10')).toBe(1);
    });

    test('matches the second player on the same time control with the first', () => {
        const matchmaker = createMatchmaker();
        matchmaker.addPlayer('player-1', '10');

        expect(matchmaker.addPlayer('player-2', '10')).toEqual({
            status: 'matched',
            whiteId: 'player-2',
            blackId: 'player-1',
            time: '10'
        });
    });

    test('does not match players on different time controls', () => {
        const matchmaker = createMatchmaker();

        expect(matchmaker.addPlayer('player-1', '10')).toEqual({ status: 'waiting' });
        expect(matchmaker.addPlayer('player-2', '15')).toEqual({ status: 'waiting' });
        expect(matchmaker.getWaitingCount('10')).toBe(1);
        expect(matchmaker.getWaitingCount('15')).toBe(1);
    });

    test('does not queue the same player twice', () => {
        const matchmaker = createMatchmaker();

        expect(matchmaker.addPlayer('player-1', '10')).toEqual({ status: 'waiting' });
        expect(matchmaker.addPlayer('player-1', '10')).toEqual({ status: 'waiting' });
        expect(matchmaker.getWaitingCount('10')).toBe(1);
    });

    test('removes a waiting player from the queue', () => {
        const matchmaker = createMatchmaker();
        matchmaker.addPlayer('player-1', '10');

        matchmaker.removePlayer('player-1');

        expect(matchmaker.getWaitingCount('10')).toBe(0);
    });

    test('rejects invalid time controls', () => {
        const matchmaker = createMatchmaker();

        expect(matchmaker.addPlayer('player-1', '5')).toBeNull();
        expect(matchmaker.getWaitingCount('10')).toBe(0);
    });

    test('removes both players from the waiting queue after a match', () => {
        const matchmaker = createMatchmaker();
        matchmaker.addPlayer('player-1', '10');
        matchmaker.addPlayer('player-2', '10');

        expect(matchmaker.getWaitingCount('10')).toBe(0);
    });
});
