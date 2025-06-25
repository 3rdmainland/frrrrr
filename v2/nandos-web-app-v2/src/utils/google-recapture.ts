const RECAPTCHA_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_KEY;

export function genRecaptchaToken(action: string): Promise<string> {
  return new Promise((resolve, reject) => {

    if(window.grecaptcha == null) throw new Error('reCaptcha not found');

    window.grecaptcha.ready(function() {
      window.grecaptcha
            .execute(
                RECAPTCHA_KEY, 
                { action }
            )
            .then(resolve)
            .catch(reject)
    });
  });
}