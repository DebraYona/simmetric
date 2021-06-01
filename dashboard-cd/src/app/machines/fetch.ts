/* eslint-disable import/prefer-default-export */
import { Machine, assign } from 'xstate';

interface FetchStates {
  states: {
    idle: {};
    pending: {};
    successful: {
      states: {
        unknown: {};
        withData: {};
        withoutData: {};
      };
    };
    failed: {};
  };
}

type FetchMachineEvents =
  | { type: 'FETCH'; params?: unknown }
  | { type: 'RESOLVE'; results: unknown }
  | { type: 'REJECT'; message: string };

interface FetchContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any[];
  message: string;
}

export const fetchMachine = Machine<
  FetchContext,
  FetchStates,
  FetchMachineEvents
>(
  {
    id: 'fetch',
    initial: 'idle',
    context: {
      results: [],
      message: ''
    },
    states: {
      idle: {
        on: {
          FETCH: 'pending'
        }
      },
      pending: {
        invoke: {
          src: 'fetchData',
          onDone: { target: 'successful', actions: ['setResults'] },
          onError: { target: 'failed', actions: ['setMessage'] }
        }
      },
      failed: {
        on: {
          FETCH: 'pending'
        }
      },
      successful: {
        initial: 'unknown',
        on: {
          FETCH: 'pending'
        },
        states: {
          unknown: {
            on: {
              '': [
                {
                  target: 'withData',
                  cond: 'hasData'
                },
                { target: 'withoutData' }
              ]
            }
          },
          withData: {},
          withoutData: {}
        }
      }
    }
  },
  {
    actions: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setResults: assign((_ctx, event: any) => {
        console.log(event);
        if (event.data === 'Network Error') {
          return {
            message: event.data.message
          };
        }
        if (event.data === undefined) {
          return {
            results: []
          };
        }
        return {
          results: event.data
        };
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMessage: assign((_ctx, event: any) => {
        console.log(event);
        return {
          message: event.data.response.data.message
        };
      })
    },
    guards: {
      hasData: ctx => {
        return ctx.results && ctx.results.length > 0;
      }
    }
  }
);
