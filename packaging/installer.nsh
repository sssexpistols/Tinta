!include nsDialogs.nsh
!include LogicLib.nsh

!ifndef BUILD_UNINSTALLER
Var TintaAIChoice
Var TintaAICheck
!macro customPageAfterChangeDir
  Page custom TintaAIPage TintaAILeave

Function TintaAIPage
  ${If} ${isUpdated}
    Abort
  ${EndIf}
  IfSilent 0 +2
    Abort
  !insertmacro MUI_HEADER_TEXT "IA local opcional" "Tinta funciona sin descargar modelos de inteligencia artificial."
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}
  ${NSD_CreateLabel} 0 0 100% 50u "Las notas, plantillas, diagramas y fórmulas están incluidas. La predicción y la revisión con IA requieren Ollama y un modelo local (entre 1 y 5 GB adicionales). Tus notas no se envían a un proveedor de IA."
  Pop $0
  ${NSD_CreateCheckbox} 0 62u 100% 26u "Configurar la IA local al abrir Tinta"
  Pop $TintaAICheck
  ${NSD_SetState} $TintaAICheck ${BST_UNCHECKED}
  ${NSD_CreateLabel} 0 103u 100% 35u "Puedes omitir este paso y descargar un modelo después desde Preferencias. El asistente recomienda un tamaño según la memoria del equipo y pide iniciar la descarga."
  Pop $0
  nsDialogs::Show
FunctionEnd

Function TintaAILeave
  ${NSD_GetState} $TintaAICheck $TintaAIChoice
FunctionEnd
!macroend

!macro customInstall
  ${If} $TintaAIChoice == ${BST_CHECKED}
    SetShellVarContext current
    CreateDirectory "$APPDATA\Tinta"
    FileOpen $0 "$APPDATA\Tinta\ai-setup-requested" w
    FileWrite $0 "1"
    FileClose $0
  ${EndIf}
!macroend
!endif
