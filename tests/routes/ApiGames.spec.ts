import {expect} from 'chai';
import {ApiGames} from '../../src/server/routes/ApiGames';
import {Game} from '../../src/server/Game';
import {TestPlayer} from '../TestPlayer';
import {MockResponse} from './HttpMocks';
import {RouteTestScaffolding} from './RouteTestScaffolding';
import {statusCode} from '@/common/http/statusCode';

function post(scaffolding: RouteTestScaffolding, res: MockResponse, body: unknown): Promise<void> {
  const p = scaffolding.post(ApiGames.INSTANCE, res);
  Promise.resolve().then(() => {
    scaffolding.req.emitString(JSON.stringify(body));
    scaffolding.req.emitter.emit('end');
  });
  return p;
}

describe('ApiGames', () => {
  let res: MockResponse;
  let scaffolding: RouteTestScaffolding;


  beforeEach(() => {
    scaffolding = new RouteTestScaffolding();
    res = new MockResponse();
  });

  it('validates server id', () => {
    scaffolding.url = '/api/games';
    ApiGames.INSTANCE.processRequest(scaffolding.req, res, scaffolding.ctx);
    expect(res.statusCode).eq(statusCode.forbidden);
    expect(res.content).eq('forbidden');
  });

  it('simple', async () => {
    scaffolding.url = '/api/games?serverId=1';
    scaffolding.req.method = 'GET';
    await ApiGames.INSTANCE.processRequest(scaffolding.req, res, scaffolding.ctx);
    expect(res.content).eq('[]');
  });

  it('a game', async () => {
    const player = TestPlayer.BLACK.newPlayer();
    await scaffolding.ctx.gameLoader.add(Game.newInstance('game-id', [player], player, 'spectatorid'));
    await ApiGames.INSTANCE.get(scaffolding.req, res, scaffolding.ctx);
    // Player ids aren't exactly available in the fake game loader.
    // A base class shared between GameLoader and FakeGameLoader would fix that.
    expect(res.content).eq('[{"gameId":"game-id","participantIds":[]}]');
  });

  it('POST purges a single game', async () => {
    scaffolding.url = '/api/games?serverId=1';
    const player = TestPlayer.BLACK.newPlayer();
    await scaffolding.ctx.gameLoader.add(Game.newInstance('gpurgeme', [player], player, 'spec1'));

    await post(scaffolding, res, {gameId: 'gpurgeme'});

    expect(res.statusCode).eq(statusCode.ok);
    expect(JSON.parse(res.content)).deep.eq({deleted: 1});
    expect(await scaffolding.ctx.gameLoader.getGame('gpurgeme')).is.undefined;
  });

  it('POST with mode "all" purges every game', async () => {
    scaffolding.url = '/api/games?serverId=1';
    const p1 = TestPlayer.BLACK.newPlayer();
    const p2 = TestPlayer.BLUE.newPlayer();
    await scaffolding.ctx.gameLoader.add(Game.newInstance('g1', [p1], p1, 's1'));
    await scaffolding.ctx.gameLoader.add(Game.newInstance('g2', [p2], p2, 's2'));

    await post(scaffolding, res, {mode: 'all'});

    expect(res.statusCode).eq(statusCode.ok);
    expect(JSON.parse(res.content)).deep.eq({deleted: 2});
    expect(await scaffolding.ctx.gameLoader.getIds()).is.empty;
  });

  it('POST validates the server id', async () => {
    scaffolding.url = '/api/games';
    await post(scaffolding, res, {mode: 'all'});
    expect(res.statusCode).eq(statusCode.forbidden);
  });

  it('POST rejects a request with neither gameId nor mode', async () => {
    scaffolding.url = '/api/games?serverId=1';
    await post(scaffolding, res, {});
    expect(res.statusCode).eq(statusCode.badRequest);
  });
});
