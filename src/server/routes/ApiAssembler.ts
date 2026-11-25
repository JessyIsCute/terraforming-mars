import * as responses from '../server/responses';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {Request} from '../Request';
import {Response} from '../Response';
import {RouteError} from './RouteError';
import {QuotaConfig, QuotaHandler, getQuotaConfigsFromEnv} from '../server/QuotaHandler';
import {ASSEMBLER_PREVIEW_LIMITS} from '../../common/assembler/AssemblerPreview';
import {AssemblerPreviewError, parsePreviewRequest, previewCards} from '../assembler/AssemblerPreview';
import {buildValueTable} from '../assembler/AssemblerValueTable';
import {AssemblerValueTableModel} from '../../common/assembler/AssemblerValueTable';

// ASSEMBLER_PREVIEW_QUOTA: a {limit, per} object or an array of them, like MAP_LIBRARY_SUBMIT_QUOTA.
function getQuotaConfigs(): Array<QuotaConfig> {
  return getQuotaConfigsFromEnv('ASSEMBLER_PREVIEW_QUOTA', {limit: 60, perMs: 60 * 1000});
}

/**
 * Assembler (fan): GET generates cards for the card generator page. See
 * src/common/assembler/AssemblerPreview.ts for the query parameters.
 */
export class ApiAssembler extends Handler {
  public static readonly INSTANCE = new ApiAssembler();
  private quotaHandlers: Array<QuotaHandler>;

  public constructor(quotaConfigs: Array<QuotaConfig> = getQuotaConfigs()) {
    super();
    this.quotaHandlers = quotaConfigs.map((config) => new QuotaHandler(config));
  }

  // Generating is synchronous; errors still go back as a rejected promise, like other routes.
  public override get(req: Request, res: Response, ctx: Context): Promise<void> {
    if (!this.quotaHandlers.every((handler) => handler.measure(ctx))) {
      responses.quotaExceeded(req, res);
      return Promise.resolve();
    }
    try {
      const request = parsePreviewRequest(ctx.url.searchParams, () => 1 + Math.floor(Math.random() * ASSEMBLER_PREVIEW_LIMITS.MAX_SEED));
      responses.writeJson(res, ctx, previewCards(request));
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e instanceof AssemblerPreviewError ? RouteError.badRequest(e.message) : e);
    }
  }
}

/** Assembler (fan): GET the value table shown on the card generator page. */
export class ApiAssemblerValues extends Handler {
  public static readonly INSTANCE = new ApiAssemblerValues();
  // Built from constants, so it never changes while the server runs.
  private table: AssemblerValueTableModel | undefined;

  private constructor() {
    super();
  }

  public override get(_req: Request, res: Response, ctx: Context): Promise<void> {
    this.table ??= buildValueTable();
    responses.writeJson(res, ctx, this.table);
    return Promise.resolve();
  }
}
