# Local Setup — Eligetuplan (test)

## Primera vez (instalar dependencias)

```powershell
cd C:\Users\Hp\Documents\Eligetuplan\test\frontend
npm install
```

---

## Cada vez que trabajes

```powershell
cd C:\Users\Hp\Documents\Eligetuplan
.\setup.ps1
```

Esto levanta backend (:8000) + frontend (:3000) en background y abre VS Code.

---

## Otros comandos útiles

```powershell
.\restart_test.ps1           # reiniciar ambos servidores
.\restart_test.ps1 -Status   # ver si están corriendo
.\restart_test.ps1 -Stop     # detener todo al terminar el día
```

---

## URLs

| | URL |
|---|---|
| Web | http://localhost:3000 |
| Wizard | http://localhost:3000/tu-mejor-plan |
| API | http://localhost:8000/docs |

---

## Ver logs en vivo

```powershell
Get-Content "logs\backend.log.err" -Wait -Tail 30   # backend
Get-Content "logs\frontend.log"    -Wait -Tail 30   # frontend
```
