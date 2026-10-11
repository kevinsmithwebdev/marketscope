import {
  BadGatewayException,
  CallHandler,
  ExecutionContext,
  GatewayTimeoutException,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError, timer } from "rxjs";
import { switchMap } from "rxjs/operators";

type HeaderRequest = {
  header(name: string): string | undefined;
};

export function simulationEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const flag = env.MARKETSCOPE_SIMULATION;
  if (flag === "1" || flag === "true") {
    return true;
  }
  if (flag === "0" || flag === "false") {
    return false;
  }
  return env.NODE_ENV !== "production";
}

@Injectable()
export class SimulationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<HeaderRequest>();
    const mode = request.header("x-marketscope-sim");

    if (mode === "error") {
      return throwError(() => new BadGatewayException("Simulated provider failure"));
    }

    if (mode === "timeout") {
      return timer(8000).pipe(
        switchMap(() => throwError(() => new GatewayTimeoutException("Simulated timeout"))),
      );
    }

    return next.handle();
  }
}
