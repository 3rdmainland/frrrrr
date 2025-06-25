import { Ref, watch } from "vue";

// Makes the body unscrollable when the ref is true
export function useHideScrollWatcher(targetRef: Ref<boolean>) {
    watch(targetRef, () => {
        if (targetRef.value) { document.body.style.overflow = 'hidden';}
        else { document.body.style.overflow = 'revert';}
    }, {immediate: true});
}