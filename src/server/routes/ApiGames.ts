import * as responses from '../server/responses';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {Request} from '../Request';
import {Response} from '../Response';
import {RouteError} from './RouteError';
import {readBody} from './readBody';
import {isGameId} from '../../common/Types';

type PurgeRequest = {
  gameId?: string;
  mode?: 'finishedAndAbandoned' | 'all';
};

export class ApiGames extends Handler {
  public static readonly INSTANCE = new ApiGames();
  private constructor() {
    super({validateServerId: true});
  }

  public override async get(_req: Request, res: Response, ctx: Context): Promise<void> {
    const list = await ctx.gameLoader.getIds();
    if (list === undefined) {
      throw RouteError.notFound('could not load game list');
    }
    responses.writeJson(res, ctx, list);
  }

  // Admin purge. Guarded by `validateServerId` (same as the games overview page).
  public override async post(req: Request, res: Response, ctx: Context): Promise<void> {
    let body: PurgeRequest;
    try {
      body = JSON.parse(await readBody(req));
    } catch (e) {
      throw RouteError.badRequest('invalid body');
    }

    if (body.gameId !== undefined) {
      if (!isGameId(body.gameId)) {
        throw RouteError.badRequest('invalid game id');
      }
      await ctx.gameLoader.deleteGame(body.gameId);
      responses.writeJson(res, ctx, {deleted: 1});
      return;
    }

    switch (body.mode) {
    case 'finishedAndAbandoned': {
      const deleted = await ctx.gameLoader.purgeFinishedAndAbandonedGames();
      responses.writeJson(res, ctx, {deleted});
      return;
    }
    case 'all': {
      const deleted = await ctx.gameLoader.purgeAllGames();
      responses.writeJson(res, ctx, {deleted});
      return;
    }
    default:
      throw RouteError.badRequest('specify a gameId or a mode');
    }
  }
}
