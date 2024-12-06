19.0.0 (December 5, 2024) Latest
@jackpope jackpope released this 10 hours ago
· 57 commits to main since this release
 v19.0.0
 7aa5dda
Below is a list of all new features, APIs, deprecations, and breaking changes. Read React 19 release post and React 19 upgrade guide for more information.

Note: To help make the upgrade to React 19 easier, we’ve published a react@18.3 release that is identical to 18.2 but adds warnings for deprecated APIs and other changes that are needed for React 19. We recommend upgrading to React 18.3.1 first to help identify any issues before upgrading to React 19.

New Features
React
Actions: startTransition can now accept async functions. Functions passed to startTransition are called “Actions”. A given Transition can include one or more Actions which update state in the background and update the UI with one commit. In addition to updating state, Actions can now perform side effects including async requests, and the Action will wait for the work to finish before finishing the Transition. This feature allows Transitions to include side effects like fetch() in the pending state, and provides support for error handling, and optimistic updates.
useActionState: is a new hook to order Actions inside of a Transition with access to the state of the action, and the pending state. It accepts a reducer that can call Actions, and the initial state used for first render. It also accepts an optional string that is used if the action is passed to a form action prop to support progressive enhancement in forms.
useOptimistic: is a new hook to update state while a Transition is in progress. It returns the state, and a set function that can be called inside a transition to “optimistically” update the state to expected final value immediately while the Transition completes in the background. When the transition finishes, the state is updated to the new value.
use: is a new API that allows reading resources in render. In React 19, use accepts a promise or Context. If provided a promise, use will suspend until a value is resolved. use can only be used in render but can be called conditionally.
ref as a prop: Refs can now be used as props, removing the need for forwardRef.
Suspense sibling pre-warming: When a component suspends, React will immediately commit the fallback of the nearest Suspense boundary, without waiting for the entire sibling tree to render. After the fallback commits, React will schedule another render for the suspended siblings to “pre-warm” lazy requests.
React DOM Client
<form> action prop: Form Actions allow you to manage forms automatically and integrate with useFormStatus. When a <form> action succeeds, React will automatically reset the form for uncontrolled components. The form can be reset manually with the new requestFormReset API.
<button> and <input> formAction prop: Actions can be passed to the formAction prop to configure form submission behavior. This allows using different Actions depending on the input.
useFormStatus: is a new hook that provides the status of the parent <form> action, as if the form was a Context provider. The hook returns the values: pending, data, method, and action.
Support for Document Metadata: We’ve added support for rendering document metadata tags in components natively. React will automatically hoist them into the <head> section of the document.
Support for Stylesheets: React 19 will ensure stylesheets are inserted into the <head> on the client before revealing the content of a Suspense boundary that depends on that stylesheet.
Support for async scripts: Async scripts can be rendered anywhere in the component tree and React will handle ordering and deduplication.
Support for preloading resources: React 19 ships with preinit, preload, prefetchDNS, and preconnect APIs to optimize initial page loads by moving discovery of additional resources like fonts out of stylesheet loading. They can also be used to prefetch resources used by an anticipated navigation.
React DOM Server
Added prerender and prerenderToNodeStream APIs for static site generation. They are designed to work with streaming environments like Node.js Streams and Web Streams. Unlike renderToString, they wait for data to load for HTML generation.
React Server Components
RSC features such as directives, server components, and server functions are now stable. This means libraries that ship with Server Components can now target React 19 as a peer dependency with a react-server export condition for use in frameworks that support the Full-stack React Architecture. The underlying APIs used to implement a React Server Components bundler or framework do not follow semver and may break between minors in React 19.x. See docs for how to support React Server Components.
Deprecations
Deprecated: element.ref access: React 19 supports ref as a prop, so we’re deprecating element.ref in favor of element.props.ref. Accessing will result in a warning.
react-test-renderer: In React 19, react-test-renderer logs a deprecation warning and has switched to concurrent rendering for web usage. We recommend migrating your tests to @testinglibrary.com/docs/react-testing-library/intro/) or @testingesting-library.com/docs/react-native-testing-library/intro)
Breaking Changes
React 19 brings in a number of breaking changes, including the removals of long-deprecated APIs. We recommend first upgrading to 18.3.1, where we've added additional deprecation warnings. Check out the upgrade guide for more details and guidance on codemodding.

React
New JSX Transform is now required: We introduced a new JSX transform in 2020 to improve bundle size and use JSX without importing React. In React 19, we’re adding additional improvements like using ref as a prop and JSX speed improvements that require the new transform.
Errors in render are not re-thrown: Errors that are not caught by an Error Boundary are now reported to window.reportError. Errors that are caught by an Error Boundary are reported to console.error. We’ve introduced onUncaughtError and onCaughtError methods to createRoot and hydrateRoot to customize this error handling.
Removed: propTypes: Using propTypes will now be silently ignored. If required, we recommend migrating to TypeScript or another type-checking solution.
Removed: defaultProps for functions: ES6 default parameters can be used in place. Class components continue to support defaultProps since there is no ES6 alternative.
Removed: contextTypes and getChildContext: Legacy Context for class components has been removed in favor of the contextType API.
Removed: string refs: Any usage of string refs need to be migrated to ref callbacks.
Removed: Module pattern factories: A rarely used pattern that can be migrated to regular functions.
Removed: React.createFactory: Now that JSX is broadly supported, all createFactory usage can be migrated to JSX components.
Removed: react-test-renderer/shallow: This has been a re-export of react-shallow-renderer since React 18. If needed, you can continue to use the third-party package directly. We recommend using @testinglibrary.com/docs/react-testing-library/intro/) or @testingesting-library.com/docs/react-native-testing-library/intro) instead.
React DOM
Removed: react-dom/test-utils: We’ve moved act from react-dom/test-utils to react. All other utilities have been removed.
Removed: ReactDOM.render, ReactDOM.hydrate: These have been removed in favor of the concurrent equivalents: ReactDOM.createRoot and ReactDOM.hydrateRoot.
Removed: unmountComponentAtNode: Removed in favor of root.unmount().
Removed: ReactDOM.findDOMNode: You can replace ReactDOM.findDOMNode with DOM Refs.
Notable Changes
React
<Context> as a provider: You can now render <Context> as a provider instead of <Context.Provider>.
Cleanup functions for refs: When the component unmounts, React will call the cleanup function returned from the ref callback.
useDeferredValue initial value argument: When provided, useDeferredValue will return the initial value for the initial render of a component, then schedule a re-render in the background with the deferredValue returned.
Support for Custom Elements: React 19 now passes all tests on Custom Elements Everywhere.
StrictMode changes: useMemo and useCallback will now reuse the memoized results from the first render, during the second render. Additionally, StrictMode will now double-invoke ref callback functions on initial mount.
UMD builds removed: To load React 19 with a script tag, we recommend using an ESM-based CDN such as esm.sh.
React DOM
Diffs for hydration errors: In the case of a mismatch, React 19 logs a single error with a diff of the mismatched content.
Compatibility with third-party scripts and extensions: React will now force a client re-render to fix up any mismatched content caused by elements inserted by third-party JS.
TypeScript Changes
The most common changes can be codemodded with npx types-react-codemod@latest preset-19 ./path-to-your-react-ts-files.

Removed deprecated TypeScript types:
ReactChild (replacement: React.ReactElement | number | string)
ReactFragment (replacement: Iterable<React.ReactNode>)
ReactNodeArray (replacement: ReadonlyArray<React.ReactNode>)
ReactText (replacement: number | string)
VoidFunctionComponent (replacement: FunctionComponent)
VFC (replacement: FC)
Moved to prop-types: Requireable, ValidationMap, Validator, WeakValidationMap
Moved to create-react-class: ClassicComponentClass, ClassicComponent, ClassicElement, ComponentSpec, Mixin, ReactChildren, ReactHTML, ReactSVG, SFCFactory
Disallow implicit return in refs: refs can now accept cleanup functions. When you return something else, we can’t tell if you intentionally returned something not meant to clean up or returned the wrong value. Implicit returns of anything but functions will now error.
Require initial argument to useRef: The initial argument is now required to match useState, createContext etc
Refs are mutable by default: Ref objects returned from useRef() are now always mutable instead of sometimes being immutable. This feature was too confusing for users and conflicted with legit cases where refs were managed by React and manually written to.
Strict ReactElement typing: The props of React elements now default to unknown instead of any if the element is typed as ReactElement
JSX namespace in TypeScript: The global JSX namespace is removed to improve interoperability with other libraries using JSX. Instead, the JSX namespace is available from the React package: import { JSX } from 'react'
Better useReducer typings: Most useReducer usage should not require explicit type arguments.
For example,
-useReducer<React.Reducer<State, Action>>(reducer)
+useReducer(reducer)
or
-useReducer<React.Reducer<State, Action>>(reducer)
+useReducer<State, [Action]>(reducer)
All Changes
React
Add support for async Actions (#26621, #26726, #28078, #28097, #29226, #29618, #29670, #26716 by @acdlite and @sebmarkbage)
Add useActionState() hook to update state based on the result of a Form Action (#27270, #27278, #27309, #27302, #27307, #27366, #27370, #27321, #27374, #27372, #27397, #27399, #27460, #28557, #27570, #27571, #28631, #28788, #29694, #29695, #29694, #29665, #28232, #28319 by @acdlite, @eps1lon, and @rickhanlonii)
Add use() API to read resources in render (#25084, #25202, #25207, #25214, #25226, #25247, #25539, #25538, #25537, #25543, #25561, #25620, #25615, #25922, #25641, #25634, #26232, #26536, #26739, #28233 by @acdlite, @mofeiZ, @sebmarkbage, @sophiebits, @eps1lon, and @hansottowirtz)
Add useOptimistic() hook to display mutated state optimistically during an async mutation (#26740, #26772, #27277, #27453, #27454, #27936 by @acdlite)
Added an initialValue argument to useDeferredValue() hook (#27500, #27509, #27512, #27888, #27550 by @acdlite)
Support refs as props, warn on element.ref access (#28348, #28464, #28731 by @acdlite)
Support Custom Elements (#22184, #26524, #26523, #27511, #24541 by @josepharhar, @sebmarkbage, @gnoff and @eps1lon)
Add ref cleanup function (#25686, #28883, #28910 by @sammy-SC), @jackpope, and @kassens)
Sibling pre-rendering replaced by sibling pre-warming (#26380, #26549, #30761, #30800, #30762, #30879, #30934, #30952, #31056, #31452 by @sammy-SC), @acdlite, @gnoff, @jackpope, @rickhanlonii)
Don’t rethrow errors at the root (#28627, #28641 by @sebmarkbage)
Batch sync discrete, continuous, and default lanes (#25700 by @tyao1)
Switch <Context> to mean <Context.Provider> (#28226 by @gaearon)
Changes to StrictMode
Handle info, group, and groupCollapsed in StrictMode logging (#25172 by @timneutkens)
Refs are now attached/detached/attached in StrictMode (#25049 by @sammy-SC)
Fix useSyncExternalStore() hydration in StrictMode (#26791 by @sophiebits)
Always trigger componentWillUnmount() in StrictMode (#26842 by @tyao1)
Restore double invoking useState() and useReducer() initializer functions in StrictMode (#28248 by @eps1lon)
Reuse memoized result from first pass (#25583 by @acdlite)
Fix useId() in StrictMode (#25713 by @gnoff)
Add component name to StrictMode error messages (#25718 by @sammy-SC)
Add support for rendering BigInt (#24580 by @eps1lon)
act() no longer checks shouldYield which can be inaccurate in test environments (#26317 by @acdlite)
Warn when keys are spread with props (#25697, #26080 by @sebmarkbage and @kassens)
Generate sourcemaps for production build artifacts (#26446 by @markerikson)
Improve stack diffing algorithm (#27132 by @KarimP)
Suspense throttling lowered from 500ms to 300ms (#26803 by @acdlite)
Lazily propagate context changes (#20890 by @acdlite and @gnoff)
Immediately rerender pinged fiber (#25074 by @acdlite)
Move update scheduling to microtask (#26512 by @acdlite)
Consistently apply throttled retries (#26611, #26802 by @acdlite)
Suspend Thenable/Lazy if it's used in React.Children (#28284 by @sebmarkbage)
Detect infinite update loops caused by render phase updates (#26625 by @acdlite)
Update conditional hooks warning (#29626 by @sophiebits)
Update error URLs to go to new docs (#27240 by @rickhanlonii)
Rename the react.element symbol to react.transitional.element (#28813 by @sebmarkbage)
Fix crash when suspending in shell during useSyncExternalStore() re-render (#27199 by @acdlite)
Fix incorrect “detected multiple renderers" error in tests (#22797 by @eps1lon)
Fix bug where effect cleanup may be called twice after bailout (#26561 by @acdlite)
Fix suspending in shell during discrete update (#25495 by @acdlite)
Fix memory leak after repeated setState bailouts (#25309 by @acdlite)
Fix useSyncExternalStore() dropped update when state is dispatched in render phase (#25578 by @pandaiolo)
Fix logging when rendering a lazy fragment (#30372 by @tomtom-sherman))
Remove string refs (#25383, #28322 by @eps1lon and @acdlite)
Remove Legacy Context (#30319 by @kassens)
Remove RefreshRuntime.findAffectedHostInstances (#30538 by @gaearon)
Remove client caching from cache() API (#27977, #28250 by @acdlite and @gnoff)
Remove propTypes (#28324, #28326 by @gaearon)
Remove defaultProps support, except for classes (#28733 by @acdlite)
Remove UMD builds (#28735 by @gnoff)
Remove delay for non-transition updates (#26597 by @acdlite)
Remove createFactory (#27798 by @kassens)
React DOM
Adds Form Actions to handle form submission (#26379, #26674, #26689, #26708, #26714, #26735, #26846, #27358, #28056 by @sebmarkbage, @acdlite, and @jupapios)
Add useFormStatus() hook to provide status information of the last form submission (#26719, #26722, #26788, #29019, #28728, #28413 by @acdlite and @eps1lon)
Support for Document Metadata. Adds preinit, preinitModule, preconnect, prefetchDNS, preload, and preloadModule APIs.
#25060, #25243, #25388, #25432, #25436, #25426, #25500, #25480, #25508, #25515, #25514, #25532, #25536, #25534, #25546, #25559, #25569, #25599, #25689, #26106, #26152, #26239, #26237, #26280, #26154, #26256, #26353, #26427, #26450, #26502, #26514, #26531, #26532, #26557, #26871, #26881, #26877, #26873, #26880, #26942, #26938, #26940, #26939, #27030, #27201, #27212, #27217, #27218, #27220, #27224, #27223, #27269, #27260, #27347, #27346, #27361, #27400, #27541, #27610, #28110, #29693, #29732, #29811, #27586, #28069 by @gnoff, @sebmarkbage, @acdlite, @kassens, @sokra, @sweetliquid
Add fetchPriority to <img> and <link> (#25927 by @styfle)
Add support for SVG transformOrigin prop (#26130 by @aravarav-ind))
Add support for onScrollEnd event (#26789 by @devongovett)
Allow <hr> as child of <select> (#27632 by @SouSingh)
Add support for Popover API (#27981 by @eps1lon)
Add support for inert (#24730 by @eps1lon)
Add support for imageSizes and imageSrcSet (#22550 by @eps1lon)
Synchronously flush transitions in popstate events (#26025, #27559, #27505, #30759 by @tyao1 and @acdlite)
flushSync exhausts queue even if something throws (#26366 by @acdlite)
Throw error if react and react-dom versions don’t match (#29236 by @acdlite)
Ensure srcset and src are assigned last on <img> instances (#30340 by @gnoff)
Javascript URLs are replaced with functions that throw errors (#26507, #29808 by @sebmarkbage and @kassens)
Treat toggle and beforetoggle as discrete events (#29176 by @eps1lon)
Filter out empty src and href attributes (unless for <a href=”” />) (#18513, #28124 by @bvaughn and @eps1lon)
Fix unitless scale style property (#25601 by @JonnyBurger)
Fix onChange error message for controlled <select> (#27740 by @BikiBiki-das))
Fix focus restore in child windows after element reorder (#30951 by @ling1726)
Remove render, hydrate, findDOMNode, unmountComponentAtNode, unstable_createEventHandle, unstable_renderSubtreeIntoContainer, and unstable_runWithPriority. Move createRoot and hydrateRoot to react-dom/client. (#28271 by @gnoff)
Remove test-utils (#28541 by @eps1lon)
Remove unstable_flushControlled (#26397 by @kassens)
Remove legacy mode (#28468 by @gnoff)
Remove renderToStaticNodeStream() (#28873 by @gnoff)
Remove unstable_renderSubtreeIntoContainer (#29771 by @kassens)
React DOM Server
Stable release of React Server Components (Many, many PRs by @sebmarkbage, @acdlite, @gnoff, @sammy-SC, @gaearon, @sophiebits, @unstubbable, @lubieowoce)
Support Server Actions (#26124, #26632, #27459 by @sebmarkbage and @acdlite)
Changes to SSR
Add external runtime which bootstraps hydration on the client for binary transparency (#25437, #26169, #25499 by @mofeiZ and @acdlite)
Support subresource integrity for bootstrapScripts and bootstrapModules (#25104 by @gnoff)
Fix null bytes written at text chunk boundaries (#26228 by @sophiebits)
Fix logic around attribute serialization (#26526 by @gnoff)
Fix precomputed chunk cleared on Node 18 (#25645 by @feedthejim)
Optimize end tag chunks (#27522 by @yujunjung)
Gracefully handle suspending in DOM configs (#26768 by @sebmarkbage)
Check for nullish values on ReactCustomFormAction (#26770 by @sebmarkbage)
Preload bootstrapModules, bootstrapScripts, and update priority queue (#26754, #26753, #27190, #27189 by @gnoff)
Client render the nearest child or parent suspense boundary if replay errors or is aborted (#27386 by @sebmarkbage)
Don't bail out of flushing if we still have pending root tasks (#27385 by @sebmarkbage)
Ensure Resumable State is Serializable (#27388 by @sebmarkbage)
Remove extra render pass when reverting to client render (#26445 by @acdlite)
Fix unwinding context during selective hydration (#25876 by @tyao1)
Stop flowing and then abort if a stream is cancelled (#27405 by @sebmarkbage)
Pass cancellation reason to abort (#27536 by @sebmarkbage)
Add onHeaders entrypoint option (#27641, #27712 by @gnoff)
Escape <style> and <script> textContent to enable rendering inner content without dangerouslySetInnerHTML (#28870, #28871 by @gnoff)
Fallback to client replaying actions for Blob serialization (#28987 by @sebmarkbage)
Render Suspense fallback if boundary contains new stylesheet during sync update (#28965 by @gnoff)
Fix header length tracking (#30327 by @gnoff)
Use srcset to trigger load event on mount (#30351 by @gnoff)
Don't perform work when closing stream (#30497 by @gnoff)
Allow aborting during render (#30488, #30730 by @gnoff)
Start initial work immediately (#31079 by @gnoff)
A transition flowing into a dehydrated boundary no longer suspends when showing fallback (#27230 by @acdlite)
Fix selective hydration triggers false update loop error (#27439 by @acdlite)
Warn for Child Iterator of all types but allow Generator Components (#28853 by @sebmarkbage)
Include regular stack trace in serialized errors (#28684, #28738 by @sebmarkbage)
Aborting early no longer infinitely suspends (#24751 by @sebmarkbage)
Fix hydration warning suppression in text comparisons (#24784 by @gnoff)
Changes to error handling in SSR
Add diffs to hydration warnings (#28502, #28512 by @sebmarkbage)
Make Error creation lazy (#24728 by @sebmarkbage)
Remove recoverable error when a sync update flows into a dehydrated boundary (#25692 by @sebmarkbage)
Don't "fix up" mismatched text content with suppressedHydrationWarning (#26391 by @sebmarkbage)
Fix component stacks in errors (#27456 by @sebmarkbage)
Add component stacks to onError (#27761, #27850 by @gnoff and @sebmarkbage)
Throw hydration mismatch errors once (#28502 by @sebmarkbage)
Add Bun streaming server renderer (#25597 by @colinhacks)
Add nonce support to bootstrap scripts (#26738 by @danieltott)
Add crossorigin support to bootstrap scripts (#26844 by @HenriqueLimas)
Support nonce and fetchpriority in preload links (#26826 by @liuyenwei)
Add referrerPolicy to ReactDOM.preload() (#27096 by @styfle)
Add server condition for react/jsx-dev-runtime (#28921 by @himself65)
Export version (#29596 by @unstubbable)
Rename the secret export of Client and Server internals (#28786, #28789 by @sebmarkbage)
Remove layout effect warning on server (#26395 by @rickhanlonii)
Remove errorInfo.digest from onRecoverableError (#28222 by @gnoff)
ReactTestRenderer
Add deprecation error to react-test-renderer on web (#27903, #28904 by @jackpope and @acdlite)
Render with ConcurrentRoot on web (#28498 by @jackpope)
Remove react-test-renderer/shallow export (#25475, #28497 by @sebmarkbage and @jackpope)
React Reconciler
Enable suspending commits without blocking render (#26398, #26427 by @acdlite)
Remove prepareUpdate (#26583, #27409 by @sebmarkbage and @sophiebits)
React-Is
Enable tree shaking (#27701 by @markerikson)
Remove isConcurrentMode and isAsyncMode methods (#28224 by @gaearon)
useSyncExternalStore
Remove React internals access (#29868 by @phryneas)
Fix stale selectors keeping previous store references (#25969 by @jellevoost)
