import { describe, it } from '../../utils/mochaw'
import { goToPassportUploadScreen, uploadFileAndClickConfirmButton } from './sharedFlows.js'
import { until } from 'selenium-webdriver'
const assert = require('chai').assert

const options = {
  pageObjects: [
    'Welcome',
    'Camera',
    'CrossDeviceIntro',
    'CameraPermissions',
    'Confirm',
    'DocumentSelector',
    'PassportUploadImageGuide',
    'DocumentUpload',
    'LivenessIntro',
    'SelfieIntro',
    'VerificationComplete',
    'BasePage'
  ]
}

export const faceScenarios = (lang) => {
  describe(`FACE scenarios in ${lang}`, options, ({driver, pageObjects}) => {
    const {
      welcome,
      camera,
      crossDeviceIntro,
      cameraPermissions,
      confirm,
      documentSelector,
      passportUploadImageGuide,
      documentUpload,
      livenessIntro,
      selfieIntro,
      verificationComplete,
      basePage
    } = pageObjects

    const copy = basePage.copy(lang)

    it('should return unsupported file type error for selfie', async () => {
      goToPassportUploadScreen(driver, welcome, documentSelector, `?language=${lang}&async=false&useUploader=true`)
      documentUpload.clickUploadButton()
      uploadFileAndClickConfirmButton(passportUploadImageGuide, confirm, 'passport.jpg')
      uploadFileAndClickConfirmButton(documentUpload, confirm, 'national_identity_card.pdf')
      confirm.verifyUnsuppoertedFileError(copy)
    })

    it('should upload selfie', async () => {
      goToPassportUploadScreen(driver, welcome, documentSelector,`?language=${lang}&async=false&useUploader=true`)
      documentUpload.clickUploadButton()
      uploadFileAndClickConfirmButton(passportUploadImageGuide, confirm, 'passport.jpg')
      uploadFileAndClickConfirmButton(documentUpload, confirm, 'face.jpeg')
      verificationComplete.verifyUIElements(copy)
      verificationComplete.checkBackArrowIsNotDisplayed()
    })

    it('should take one selfie using the camera stream', async () => {
      goToPassportUploadScreen(driver, welcome, documentSelector,`?language=${lang}&async=false`)
      documentUpload.clickUploadButton()
      uploadFileAndClickConfirmButton(passportUploadImageGuide, confirm, 'passport.jpg')
      selfieIntro.verifyUIElementsOnTheSelfieIntroScreen(copy)
      selfieIntro.clickOnContinueButton()
      camera.takeSelfie()
      confirm.clickConfirmButton()
      verificationComplete.verifyUIElements(copy)
      verificationComplete.checkBackArrowIsNotDisplayed()
    })

    it('should complete the flow when snapshot is disabled', async () => {
      goToPassportUploadScreen(driver, welcome, documentSelector,`?language=${lang}&async=false&useMultipleSelfieCapture=false`)
      documentUpload.clickUploadButton()
      uploadFileAndClickConfirmButton(passportUploadImageGuide, confirm, 'passport.jpg')
      selfieIntro.verifyUIElementsOnTheSelfieIntroScreen(copy)
      selfieIntro.clickOnContinueButton()
      camera.takeSelfie()
      confirm.clickConfirmButton()
      verificationComplete.verifyUIElements(copy)
      verificationComplete.checkBackArrowIsNotDisplayed()
    })

    it('should return no face found error for selfie', async () => {
      goToPassportUploadScreen(driver, welcome, documentSelector,`?language=${lang}&async=false&useUploader=true`)
      documentUpload.clickUploadButton()
      uploadFileAndClickConfirmButton(passportUploadImageGuide, confirm, 'passport.jpg')
      uploadFileAndClickConfirmButton(documentUpload, confirm, 'llama.jpg')
      confirm.verifyNoFaceError(copy)
    })

    it('should return multiple faces error', async () => {
      goToPassportUploadScreen(driver, welcome, documentSelector,`?language=${lang}&async=false&useUploader=true`)
      documentUpload.clickUploadButton()
      uploadFileAndClickConfirmButton(passportUploadImageGuide, confirm, 'passport.jpg')
      uploadFileAndClickConfirmButton(documentUpload, confirm, 'two_faces.jpg')
      confirm.verifyMultipleFacesError(copy)
    })

    it('should be taken to the cross-device flow for selfie capture there is no camera and liveness variant requested', async () => {
      goToPassportUploadScreen(driver, welcome, documentSelector,`?language=${lang}&async=false&liveness=true`)
      driver.executeScript('window.navigator.mediaDevices.enumerateDevices = () => Promise.resolve([])')
      documentUpload.clickUploadButton()
      uploadFileAndClickConfirmButton(passportUploadImageGuide, confirm, 'passport.jpg')
      crossDeviceIntro.verifyTitle(copy)
    })

    it('should be taken to the selfie screen if browser does not have MediaRecorder API and liveness variant requested', async () => {
      goToPassportUploadScreen(driver, welcome, documentSelector,`?language=${lang}&liveness=true`)
      driver.executeScript('window.navigator.mediaDevices.enumerateDevices = () => Promise.resolve([{ kind: "video" }])')
      driver.executeScript('window.MediaRecorder = undefined')
      documentUpload.clickUploadButton()
      uploadFileAndClickConfirmButton(passportUploadImageGuide, confirm, 'passport.jpg')
      selfieIntro.verifyUIElementsOnTheSelfieIntroScreen(copy)
      selfieIntro.clickOnContinueButton()
      cameraPermissions.verifyUIElementsOnTheCameraPermissionsScreen(copy)
    })

    it('should enter the liveness flow if I have a camera and liveness variant requested', async () => {
      goToPassportUploadScreen(driver, welcome, documentSelector,`?language=${lang}&liveness=true`)
      driver.executeScript('window.navigator.mediaDevices.enumerateDevices = () => Promise.resolve([{ kind: "video" }])')
      documentUpload.clickUploadButton()
      uploadFileAndClickConfirmButton(passportUploadImageGuide, confirm, 'passport.jpg')
      livenessIntro.verifyUIElementsOnTheLivenessIntroScreen(copy)
      livenessIntro.clickOnContinueButton()
    })

    it('should enter the liveness flow and display timeout notification after 10 seconds', async () => {
      goToPassportUploadScreen(driver, welcome, documentSelector,`?language=${lang}&liveness=true`)
      driver.executeScript('window.navigator.mediaDevices.enumerateDevices = () => Promise.resolve([{ kind: "video" }])')
      documentUpload.clickUploadButton()
      uploadFileAndClickConfirmButton(passportUploadImageGuide, confirm, 'passport.jpg')
      livenessIntro.verifyUIElementsOnTheLivenessIntroScreen(copy)
      livenessIntro.clickOnContinueButton()
      camera.continueButton().click()
      driver.wait(until.elementIsVisible(camera.warningMessage()), 10000)
      assert.isFalse(camera.isOverlayPresent(), 'Test Failed: Face overlay should not be displayed')
    })

    it('should record a video with live challenge, play it and submit it', async () => {
      goToPassportUploadScreen(driver, welcome, documentSelector,`?language=${lang}&liveness=true`)
      driver.executeScript('window.navigator.mediaDevices.enumerateDevices = () => Promise.resolve([{ kind: "video" }])')
      documentUpload.clickUploadButton()
      uploadFileAndClickConfirmButton(passportUploadImageGuide, confirm, 'passport.jpg')
      livenessIntro.verifyUIElementsOnTheLivenessIntroScreen(copy)
      livenessIntro.clickOnContinueButton()
      camera.recordVideo()
      assert.isTrue(camera.isOverlayPresent(), 'Test Failed: Face overlay should be displayed')
      camera.completeChallenges()
      confirm.playVideoBeforeConfirm()
      confirm.clickConfirmButton()
      verificationComplete.backArrow().isDisplayed()
      verificationComplete.verifyUIElements(copy)
      verificationComplete.checkBackArrowIsNotDisplayed()
    })
  })
}
