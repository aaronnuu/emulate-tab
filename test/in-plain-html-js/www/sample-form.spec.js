function waitFor(description, test, retryLimit = 20, milliseconsBetweenRetries = 200) {
  let currentTry = 1;
  const waitLonger = (done) => {
    const ready = test();
    if (ready) return done();
    if (currentTry > 3) {
      console.log('css not ready (' + currentTry + ')');
    }
    if (++currentTry > retryLimit) {
      throw new Error('failed to wait for ' + description);
    }
    setTimeout(() => waitLonger(done), milliseconsBetweenRetries);
  }
  return new Promise(resolve => waitLonger(resolve));
}

describe('sample form', () => {
  const testContent = document.createElement('div');

  beforeAll(() => {
    document.body.appendChild(testContent);
  });

  beforeEach((done) => {
    testContent.innerHTML = __html__['sample-form.html'];

    waitFor('css', () => {
      const hiddenInput = document.getElementById('hidden-input');
      return !!hiddenInput && getComputedStyle(hiddenInput).display === 'none';
    }).then(done);
  }, 10000);

  it('should find expected inputs (and not hidden/disabled...)', () => {
    const selectableElementIds = emulateTab.findSelectableElements().map((e) => e.id || e.className);
    expect(selectableElementIds).toEqual([
      'input-with-tab-index-2',
      'input2-with-tab-index-2',
      'input-with-tab-index-3',
      'input-with-tab-index-4',
      'jasmine-title',
      'first-input',
      'second-input',
      'input-before-hidden-input',
      'input-after-hidden-input',
      'input-before-collapsed-input',
      'input-after-collapsed-input',
      'input-before-disabled-input',
      'input-after-disabled-input',
      'input-before-readonly-input',
      'readonly-input',
      'input-before-select',
      'select',
      'input-before-number-input',
      'number-input',
      'input-before-password-input',
      'password-input',
      'input-before-search-input',
      'search-input',
      'input-before-tel-input',
      'tel-input',
      'input-before-url-input',
      'url-input',
      'input-before-color-input',
      'color-input',
      'input-before-custom-input',
      'custom-input',
      'input-before-button',
      'button',
      'input-before-clickable-div',
      'clickable-div',
      'input-before-link',
      'link-with-href',
      'input-after-link-without-href',
      'input-before-hidden-child-input',
      'input-after-hidden-child-input',
      'input-before-collapsed-child-input',
      'input-after-collapsed-child-input',
      'last-input',
    ]);
  });

  itShouldTabFrom('first-input').to('second-input');
  itShouldTabFrom('input-before-hidden-input').to('input-after-hidden-input');
  itShouldTabFrom('input-before-number-input').to('number-input');
  itShouldTabFrom('input-before-password-input').to('password-input');
  itShouldTabFrom('input-before-search-input').to('search-input');
  itShouldTabFrom('input-before-tel-input').to('tel-input');
  itShouldTabFrom('input-before-url-input').to('url-input');
  itShouldTabFrom('input-before-custom-input').to('custom-input');

  describe('advanced api', () => {
    let firstInput;
    let secondInput;
    let lastInput;
    let otherInput;

    beforeEach(() => {
      firstInput = document.getElementById('first-input');
      secondInput = document.getElementById('second-input');
      lastInput = document.getElementById('last-input');
      otherInput = document.getElementById('button');

      if ([firstInput, secondInput, lastInput].includes(undefined)) {
        const msg = 'did not found all test inputs';
        console.error(msg, { firstInput, secondInput, lastInput, otherInput });
        throw new Error(msg);
      }
    });

    it('tab from given element to next element', async () => {
      // given
      otherInput.focus();
      const keySpy = jasmine.createSpy('keydown');
      const blurSpy = spyOn(firstInput, 'blur').and.callThrough();
      const secondFocusSpy = spyOn(secondInput, 'focus').and.callThrough();
      const keydownListener = (ev) => {
        expect(blurSpy).not.toHaveBeenCalled();
        expect(secondFocusSpy).not.toHaveBeenCalled();
        keySpy(ev);
      }
      firstInput.addEventListener('keydown', keydownListener);

      // when
      await emulateTab.from(firstInput).toNextElement();

      // then
      expect(keySpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
      expect(secondFocusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(secondInput);

      // cleanup
      firstInput.removeEventListener('keydown', keydownListener);
    });

    it('tab from given element to given element', async () => {
      // given
      otherInput.focus();
      const keySpy = jasmine.createSpy('keydown');
      const blurSpy = spyOn(firstInput, 'blur').and.callThrough();
      const focusSpy = spyOn(lastInput, 'focus').and.callThrough();
      const keydownListener = (ev) => {
        expect(blurSpy).not.toHaveBeenCalled();
        expect(focusSpy).not.toHaveBeenCalled();
        keySpy(ev);
      }
      firstInput.addEventListener('keydown', keydownListener);

      // when
      await emulateTab.from(firstInput).to(lastInput);

      // then
      expect(keySpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(lastInput);

      // cleanup
      firstInput.removeEventListener('keydown', keydownListener);
    });


    it('tab to given element', async () => {
      // given
      firstInput.focus();
      const keySpy = jasmine.createSpy('keydown');
      const blurSpy = spyOn(firstInput, 'blur').and.callThrough();
      const focusSpy = spyOn(lastInput, 'focus').and.callThrough();
      const keydownListener = (ev) => {
        expect(blurSpy).not.toHaveBeenCalled();
        expect(focusSpy).not.toHaveBeenCalled();
        keySpy(ev);
      }
      firstInput.addEventListener('keydown', keydownListener);

      // when
      await emulateTab.to(lastInput);

      // then
      expect(keySpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(lastInput);

      // cleanup
      firstInput.removeEventListener('keydown', keydownListener);
    });

    it('tab backwards', async () => {
      // given
      secondInput.focus();
      const keySpy = jasmine.createSpy('keydown');
      const blurSpy = spyOn(secondInput, 'blur').and.callThrough();
      const focusSpy = spyOn(firstInput, 'focus').and.callThrough();
      const keydownListener = (ev) => {
        expect(blurSpy).not.toHaveBeenCalled();
        expect(focusSpy).not.toHaveBeenCalled();
        keySpy(ev);
      }
      secondInput.addEventListener('keydown', keydownListener);

      // when
      await emulateTab.backwards();

      // then
      expect(keySpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(firstInput);

      // cleanup
      secondInput.removeEventListener('keydown', keydownListener);
    });

    it('tab forwards', async () => {
      // given
      firstInput.focus();
      const keySpy = jasmine.createSpy('keydown');
      const blurSpy = spyOn(firstInput, 'blur').and.callThrough();
      const focusSpy = spyOn(secondInput, 'focus').and.callThrough();
      const keydownListener = (ev) => {
        expect(blurSpy).not.toHaveBeenCalled();
        expect(focusSpy).not.toHaveBeenCalled();
        keySpy(ev);
      }
      firstInput.addEventListener('keydown', keydownListener);

      // when
      await emulateTab.forwards();

      // then
      expect(keySpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(secondInput);

      // cleanup
      firstInput.removeEventListener('keydown', keydownListener);
    });
  });
  
  describe('selection after tabbing', () => {
    it('should not try to select all in color input', () => {
      // given
      const inputBefore = document.getElementById('input-before-color-input');
      inputBefore.focus();
      const origConsoleError = console.error;
      const errorSpy = console.error = jasmine.createSpy('consoleError');
  
      // when
      try {
        emulateTab();
      } finally {
        console.error = origConsoleError;
      }
  
      // then
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should try to select all in custom input type', () => {
      // given
      const inputBefore = document.getElementById('input-before-custom-input');
      const customInput = /** @type {HTMLInputElement} */ (document.getElementById('custom-input'));
      customInput.value = 'some text';
      inputBefore.focus();
  
      // when
      emulateTab();
  
      // then
      const selectedElement = /** @type {HTMLInputElement} */ (document.activeElement);
      expect(selectedElement).toBe(customInput);
      expect(selectedElement.selectionEnd - selectedElement.selectionStart).toBe('some text'.length);
    });
  });
});

function itShouldTabFrom(sourceId) {
  return {
    to: (targetId) => {
      it (`should tab from "${sourceId}" to "${targetId}"`, async () => {
        // given
        const source = document.getElementById(sourceId);
        if (!source) throw new Error(`could not find source element with id "${sourceId}"`)
        source.focus();

        const target = document.getElementById(targetId);
        if (!target) throw new Error(`could not find target element with id "${targetId}"`)
        
        // when
        await emulateTab();

        // then
        expect(document.activeElement.id).toBe(target.id, 'element after emulateTab');
      })
    },
  };
}
