;; -*- Mode: Lisp; Syntax: Common-Lisp; Package: User; Base: 10 -*-
;;; ============================================================
;;; Nom del fitxer : generar_rampa_cte.lsp
;;; Descripció     : Genera una rampa 2D/3D segons el CTE DB-SUA.
;;;                  Calcula la pendent òptima per al recorregut més curt,
;;;                  afegeix replans i permet triar el tipus de rampa.
;;; Autor          : Assistent IA (Gemini)
;;; Versió         : 1.0
;;; Data           : 2025-04-26
;;; ============================================================
;;; Notes:
;;; - Aquest codi genera la geometria bàsica (línies de vora i replans).
;;; - Assumeix que es treballa en metres.
;;; - La generació és principalment en 2D (projecció horitzontal),
;;;   però utilitza punts 3D per definir l'alçada inicial i final
;;;   dels trams de rampa (es dibuixen les polilínies en 3D).
;;; - Per defecte, assumeix rampes rectes amb girs de 180 graus
;;;   als replans intermedis per optimitzar espai.
;;; - Cal tenir coneixements bàsics d'AutoLISP i AutoCAD.
;;; ============================================================

(defun c:GenerarRampaCTE ( / *error* punt_inici desnivell tipus_rampa_str amplada_rampa angle_inicial_rad
                             opcions_tipus pendent_max long_tram_max repla_long_min amplada_min
                             long_horitzontal_total nombre_trams long_horitzontal_per_tram
                             desnivell_per_tram long_real_tram pt_actual z_actual angle_actual
                             i pt_final_tram_horiz pt_final_tram_z pt_esq_ini pt_dre_ini
                             pt_esq_fi pt_dre_fi pt_centre_final_repla pt_repla1 pt_repla2
                             pt_repla3 pt_repla4 old_osmode old_cmdecho old_blipmode pi )

  ;; --- Funció de gestió d'errors ---
  (defun *error* (msg)
    (if old_cmdecho (setvar "CMDECHO" old_cmdecho))
    (if old_osmode (setvar "OSMODE" old_osmode))
    (if old_blipmode (setvar "BLIPMODE" old_blipmode))
    (if (not (member msg '("Function cancelled" "quit / exit abort")))
        (princ (strcat "\nError: " msg))
    )
    (princ "\nFunció GenerarRampaCTE cancel·lada.")
    (princ) ; Surt netament
  )

  ;; --- Inicialització de variables i entorn ---
  (setq old_cmdecho (getvar "CMDECHO"))
  (setvar "CMDECHO" 0) ; Desactiva l'eco de comandes
  (setq old_osmode (getvar "OSMODE"))
  (setvar "OSMODE" 0) ; Desactiva OSNAP temporalment
  (setq old_blipmode (getvar "BLIPMODE"))
  (setvar "BLIPMODE" 0) ; Desactiva Blips
  (setq pi 3.141592653589793)

  (princ "\nGenerador de Rampes segons CTE DB-SUA")

  ;; --- Recollida de dades de l'usuari ---
  (setq punt_inici (getpoint "\nIndica el punt d'inici de la rampa (centre eix): "))
  (if (not punt_inici) (progn (princ "\nCancel·lat per l'usuari.") (exit)))

  (setq desnivell (getdist punt_inici "\nIntrodueix el desnivell TOTAL a salvar (en metres): "))
  (if (or (not desnivell) (<= desnivell 0)) (progn (alert "El desnivell ha de ser un valor positiu.") (exit)))

  (initget 1 "Accessible General Vehicle") ; Permet només aquestes paraules clau
  (setq tipus_rampa_str (getkword "\nTipus de rampa [Accessible/General/Vehicle]: "))
  (if (not tipus_rampa_str) (progn (princ "\nCancel·lat per l'usuari.") (exit)))

  ;; Estableix amplada per defecte segons tipus
  (cond
    ((= tipus_rampa_str "Accessible") (setq amplada_min 1.20))
    ((= tipus_rampa_str "General") (setq amplada_min 1.20)) ; Recomanat, encara que no sigui estrictament accessible
    ((= tipus_rampa_str "Vehicle") (setq amplada_min 3.00)) ; Amplada mínima per a vehicles, pot necessitar més
  )
  (setq amplada_rampa_input (getdist punt_inici (strcat "\nIntrodueix l'amplada de la rampa (en metres) [Per defecte " (rtos amplada_min 2 2) "]: ")))
  (setq amplada_rampa (if amplada_rampa_input amplada_rampa_input amplada_min))
  (if (or (not amplada_rampa) (<= amplada_rampa 0)) (progn (alert "L'amplada ha de ser un valor positiu.") (exit)))


  (setq angle_inicial_rad (getangle punt_inici "\nIndica la direcció inicial de la rampa: "))
  (if (not angle_inicial_rad) (progn (princ "\nCancel·lat per l'usuari.") (exit)))

  ;; --- Configuració de paràmetres segons CTE DB-SUA i tipus de rampa ---
  (setq repla_long_min 1.50) ; Longitud mínima de replà en direcció de la marxa

  (cond
    ;; --- Rampa Accessible ---
    ;; Prioritza la pendent més suau (6%) per defecte en itineraris accessibles,
    ;; però comprova si es pot fer més curta amb pendents majors per trams curts.
    ((= tipus_rampa_str "Accessible")
     (princ "\nConfigurant rampa Accessible (prioritza 6%, màx. 9m tram)...")
     ;; Comprova si el desnivell total es pot salvar amb pendents majors per recorreguts curts
     (cond
       ((<= (/ desnivell 0.10) 3.0) ; Pendent 10% si longitud horitzontal total <= 3m
        (setq pendent_max 0.10)
        (setq long_tram_max 3.0)
        (princ (strcat "\n   Detectat recorregut curt. S'aplicarà pendent màxima del 10% (tram <= " (rtos long_tram_max 2 1) "m)."))
       )
       ((<= (/ desnivell 0.08) 6.0) ; Pendent 8% si longitud horitzontal total <= 6m
        (setq pendent_max 0.08)
        (setq long_tram_max 6.0)
        (princ (strcat "\n   Detectat recorregut mitjà. S'aplicarà pendent màxima del 8% (tram <= " (rtos long_tram_max 2 1) "m)."))
       )
       (t ; Pendent 6% per defecte per a longituds > 6m horitzontals
        (setq pendent_max 0.06)
        (setq long_tram_max 9.0) ; Longitud màxima de tram per pendent <= 6%
        (princ (strcat "\n   S'aplicarà pendent màxima del 6% (tram <= " (rtos long_tram_max 2 1) "m)."))
       )
     )
     (setq amplada_min 1.20)
     (if (< amplada_rampa amplada_min)
         (progn (alert (strcat "L'amplada per a rampa Accessible ha de ser >= " (rtos amplada_min 2 2) "m.")) (exit))
     )
    )

    ;; --- Rampa d'Ús General ---
    ;; Similar a l'accessible, permet optimitzar amb pendents majors en trams curts.
    ;; El CTE actual no distingeix tant, però mantenim l'opció per si l'usuari té un context específic.
    ((= tipus_rampa_str "General")
     (princ "\nConfigurant rampa d'Ús General (permetent fins a 10%/8%)...")
      (cond
       ((<= (/ desnivell 0.10) 3.0) ; Pendent 10% si longitud horitzontal total <= 3m
        (setq pendent_max 0.10)
        (setq long_tram_max 3.0)
        (princ (strcat "\n   Detectat recorregut curt. S'aplicarà pendent màxima del 10% (tram <= " (rtos long_tram_max 2 1) "m)."))
       )
       ((<= (/ desnivell 0.08) 6.0) ; Pendent 8% si longitud horitzontal total <= 6m
        (setq pendent_max 0.08)
        (setq long_tram_max 6.0)
        (princ (strcat "\n   Detectat recorregut mitjà. S'aplicarà pendent màxima del 8% (tram <= " (rtos long_tram_max 2 1) "m)."))
       )
       (t ; Pendent màxima del 12% (DB SUA 1-4.3) per a ús general *no accessible*. Però més segur limitar-la.
          ; Optem per un màxim del 8% o 6% per seguretat i acostar-nos a la norma general.
          ; Usem 6% com a límit segur si no és molt curta.
        (setq pendent_max 0.06)
        (setq long_tram_max 9.0) ; Ajustem a 9m per coherència amb replans
        (princ (strcat "\n   Recorregut llarg. S'aplicarà pendent màxima del 6% (tram <= " (rtos long_tram_max 2 1) "m)."))
       )
     )
     (setq amplada_min 1.00) ; Mínim general, recomanat 1.20
     (if (< amplada_rampa amplada_min)
         (progn (alert (strcat "L'amplada mínima recomanada per a ús general és " (rtos amplada_min 2 2) "m.")) ) ; Només avís
     )
    )

    ;; --- Rampa per a Vehicles (i Persones) ---
    ;; Prioritza pendents majors permeses per a vehicles.
    ;; Cal considerar la seguretat dels vianants si l'ús és compartit (DB SUA 1).
    ((= tipus_rampa_str "Vehicle")
     (princ "\nConfigurant rampa per a Vehicles (màx. 16%/18%)...")
     (setq pendent_max 0.16) ; Pendent màxima habitual per vehicles (16%, puntualment 18% en trams < 3m, no implementat aquí per simplicitat)
     (setq long_tram_max 15.0) ; Límit pràctic per tram, menys restrictiu que per accessibles
     (setq amplada_min 3.00)   ; Amplada mínima per a carril de vehicle
     (princ (strcat "\n   S'aplicarà pendent màxima del " (rtos (* pendent_max 100.0) 2 0) "%."))
     (princ "\n   Recorda que si hi ha circulació de vianants, cal garantir la seva seguretat (possible itinerari separat).")
     (if (< amplada_rampa amplada_min)
         (progn (alert (strcat "L'amplada mínima recomanada per a vehicles és " (rtos amplada_min 2 2) "m.")) ) ; Només avís
     )
    )
  )

  ;; --- Càlculs geomètrics ---
  (setq long_horitzontal_total (/ desnivell pendent_max))
  ; Càlcul del nombre de trams (arrodonit cap amunt)
  (setq nombre_trams (fix (+ (/ long_horitzontal_total long_tram_max) 0.99999999))) ; Ceil workaround
  (if (< nombre_trams 1) (setq nombre_trams 1)) ; Mínim 1 tram

  (setq long_horitzontal_per_tram (/ long_horitzontal_total nombre_trams))
  (setq desnivell_per_tram (/ desnivell nombre_trams))
  ; Recalcula la pendent real (serà <= pendent_max)
  (setq pendent_real (/ desnivell_per_tram long_horitzontal_per_tram))
  ; Longitud real del tram inclinat (hipotenusa)
  (setq long_real_tram (sqrt (+ (* long_horitzontal_per_tram long_horitzontal_per_tram)
                                (* desnivell_per_tram desnivell_per_tram))))

  (princ (strcat "\nCàlculs: Desnivell Total=" (rtos desnivell 2 2) "m, Pendent=" (rtos (* pendent_real 100.0) 2 1) "%"))
  (princ (strcat "\n   Longitud Horitzontal Total=" (rtos long_horitzontal_total 2 2) "m"))
  (princ (strcat "\n   Número de Trams=" (itoa nombre_trams)))
  (princ (strcat "\n   Longitud Horitzontal per Tram=" (rtos long_horitzontal_per_tram 2 2) "m"))
  (princ (strcat "\n   Desnivell per Tram=" (rtos desnivell_per_tram 2 3) "m"))
  (princ (strcat "\n   Longitud Real per Tram (inclinada)=" (rtos long_real_tram 2 2) "m"))
  (princ (strcat "\n   Replans intermedis: " (if (> nombre_trams 1) (itoa (1- nombre_trams)) "0") " de " (rtos repla_long_min 2 2) "m (longitud)"))

  ;; --- Dibuix de la rampa ---
  (setq pt_actual (list (car punt_inici) (cadr punt_inici) (if (caddr punt_inici) (caddr punt_inici) 0.0))) ; Assegura punt 3D inicial
  (setq z_actual (caddr pt_actual))
  (setq angle_actual angle_inicial_rad)

  (command "_LAYER" "_M" "Rampa_CTE" "_C" "9" "" "") ; Crea o activa capa "Rampa_CTE" color gris clar
  (command "_LAYER" "_S" "Rampa_CTE" "")

  ;; Dibuixa el primer replà (inicial) - opcional, però bo per marcar l'inici
  (setq pt_repla_ini1 (polar pt_actual (+ angle_actual (/ pi 2)) (/ amplada_rampa 2.0)))
  (setq pt_repla_ini2 (polar pt_repla_ini1 angle_actual repla_long_min))
  (setq pt_repla_ini3 (polar pt_repla_ini2 (- angle_actual (/ pi 2)) amplada_rampa))
  (setq pt_repla_ini4 (polar pt_actual (- angle_actual (/ pi 2)) (/ amplada_rampa 2.0)))
  ; Ajusta el punt d'inici de la rampa al final del replà inicial
  (setq pt_actual (polar pt_actual angle_actual repla_long_min))
  ; Dibuixa el replà inicial (rectangle)
  ; (command "_RECTANG" pt_repla_ini1 pt_repla_ini3) ; Simplificat amb rectangle
  ; Dibuixa el replà inicial (polilinia 3D a Z=z_actual)
  (command "_PLINE"
           (list (car pt_repla_ini1) (cadr pt_repla_ini1) z_actual)
           (list (car pt_repla_ini2) (cadr pt_repla_ini2) z_actual)
           (list (car pt_repla_ini3) (cadr pt_repla_ini3) z_actual)
           (list (car pt_repla_ini4) (cadr pt_repla_ini4) z_actual)
           "_C")


  ;; Bucle per dibuixar cada tram de rampa i replà intermedi
  (setq i 1)
  (while (<= i nombre_trams)
    (princ (strcat "\nDibuixant Tram " (itoa i) "..."))

    ;; Calcula punts del tram actual
    (setq pt_final_tram_horiz (polar pt_actual angle_actual long_horitzontal_per_tram))
    (setq pt_final_tram_z (+ z_actual desnivell_per_tram))

    ;; Punts de les vores de la rampa (inici i fi) en 3D
    (setq pt_esq_ini (polar pt_actual (+ angle_actual (/ pi 2)) (/ amplada_rampa 2.0)))
    (setq pt_dre_ini (polar pt_actual (- angle_actual (/ pi 2)) (/ amplada_rampa 2.0)))
    (setq pt_esq_fi (polar pt_final_tram_horiz (+ angle_actual (/ pi 2)) (/ amplada_rampa 2.0)))
    (setq pt_dre_fi (polar pt_final_tram_horiz (- angle_actual (/ pi 2)) (/ amplada_rampa 2.0)))

    ;; Dibuixa les vores de la rampa (polilínies 3D)
    (command "_PLINE" (list (car pt_esq_ini) (cadr pt_esq_ini) z_actual)
                     (list (car pt_esq_fi) (cadr pt_esq_fi) pt_final_tram_z) "")
    (command "_PLINE" (list (car pt_dre_ini) (cadr pt_dre_ini) z_actual)
                     (list (car pt_dre_fi) (cadr pt_dre_fi) pt_final_tram_z) "")

    ;; Actualitza la posició i alçada actuals (al final del tram)
    (setq pt_actual pt_final_tram_horiz) ; Punt central al final de la projecció horitzontal
    (setq z_actual pt_final_tram_z)

    ;; Dibuixa replà intermedi o final
    (if (< i nombre_trams) ; Si no és l'últim tram, dibuixa replà intermedi i gira
      (progn
        (princ " Dibuixant Replà Intermedi...")
        ;; Punts del replà (a la cota z_actual)
        (setq pt_repla1 (list (car pt_esq_fi) (cadr pt_esq_fi) z_actual))
        (setq pt_repla2 (polar pt_repla1 angle_actual repla_long_min))
        (setq pt_repla3 (polar pt_repla2 (- angle_actual (/ pi 2)) amplada_rampa))
        (setq pt_repla4 (list (car pt_dre_fi) (cadr pt_dre_fi) z_actual))

        ;; Dibuixa el replà (polilínia 3D tancada)
        (command "_PLINE" pt_repla1 pt_repla2 pt_repla3 pt_repla4 "_C")

        ;; Actualitza el punt d'inici pel següent tram (centre del costat llunyà del replà)
        (setq pt_centre_final_repla (polar pt_actual angle_actual repla_long_min))
        (setq pt_actual pt_centre_final_repla)

        ;; Gira 180 graus per al següent tram (optimització d'espai)
        (setq angle_actual (+ angle_actual pi))
        ;; Normalitza l'angle (opcional, però bona pràctica)
        (if (> angle_actual (* 2.0 pi)) (setq angle_actual (- angle_actual (* 2.0 pi))))
      )
      (progn ; És l'últim tram, dibuixa replà final
        (princ " Dibuixant Replà Final...")
        ;; Punts del replà final (a la cota z_actual)
        (setq pt_repla1 (list (car pt_esq_fi) (cadr pt_esq_fi) z_actual))
        (setq pt_repla2 (polar pt_repla1 angle_actual repla_long_min))
        (setq pt_repla3 (polar pt_repla2 (- angle_actual (/ pi 2)) amplada_rampa))
        (setq pt_repla4 (list (car pt_dre_fi) (cadr pt_dre_fi) z_actual))

        ;; Dibuixa el replà final (polilínia 3D tancada)
        (command "_PLINE" pt_repla1 pt_repla2 pt_repla3 pt_repla4 "_C")
      )
    )

    (setq i (1+ i)) ; Incrementa el comptador del bucle
  )

  ;; --- Finalització ---
  (setvar "CMDECHO" old_cmdecho) ; Restaura l'eco
  (setvar "OSMODE" old_osmode)   ; Restaura OSNAP
  (setvar "BLIPMODE" old_blipmode) ; Restaura Blips
  (princ "\nGeneració de la rampa completada.")
  (princ) ; Sortida neta de la funció LISP
)

;; --- Missatge de càrrega ---
(princ "\nCodi AutoLISP per generar rampes CTE carregat.")
(princ "\nEscriviu 'GenerarRampaCTE' a la línia de comandes per executar.")
(princ)
