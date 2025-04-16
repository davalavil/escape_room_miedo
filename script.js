const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const roomImage = document.getElementById('room-image');
const roomElement = document.getElementById('room'); // Div que contiene la imagen
const roomMessage = document.getElementById('room-message');
const actionMessage = document.getElementById('action-message');
const inventoryList = document.getElementById('inventory-list');
const jumpscareElement = document.getElementById('jumpscare');
const jumpscareImage = document.getElementById('jumpscare-image');
const muteButton = document.getElementById('mute-button');

// --- Elementos de Audio ---
const bgmSuspense = document.getElementById('bgm-suspense');
const bgmCreepy = document.getElementById('bgm-creepy');
const sfxJumpScare1 = document.getElementById('sfx-jumpscare1');
const sfxDoorCreak = document.getElementById('sfx-door-creak');
const sfxItemPickup = document.getElementById('sfx-item-pickup');
const sfxUnlock = document.getElementById('sfx-unlock');
const sfxLocked = document.getElementById('sfx-locked');
const sfxWhisper = document.getElementById('sfx-whisper');
const sfxBang = document.getElementById('sfx-bang');
// Añade más SFX aquí...

let currentRoom = null;
let inventory = [];
let isMuted = false;
let currentBGM = null;

// --- Definición de las Salas y Objetos ---
// Nota: Las coordenadas (top, left, width, height) son porcentajes (%)
//       y necesitarás ajustarlas MUCHO según tus imágenes.
//       Usa las herramientas de desarrollador del navegador (F12) para esto.
const rooms = {
    // --- SALA 1: EL SÓTANO ---
    sotano: {
        image: 'images/room1.jpeg',
        message: 'Estás en un sótano húmedo y oscuro. Huele a tierra mojada y... a algo más. Hay una puerta de madera al fondo.',
        backgroundMusic: bgmCreepy,
        objects: [
            { id: 'puerta_madera_sotano', name: 'Puerta de madera', coords: { top: '40%', left: '37%', width: '12%', height: '36%' },
                action: (state) => {
                    if (state.flags.sotano_puerta_abierta) {
                        playSound(sfxDoorCreak);
                        changeRoom('pasillo');
                    } else if (state.inventory.includes('llave_oxidada')) {
                         setMessage('La vieja cerradura cede con un chirrido. La puerta está abierta.');
                         playSound(sfxUnlock);
                         state.flags.sotano_puerta_abierta = true;
                         // Podrías eliminar la llave aquí si quieres: removeItem('llave_oxidada');
                    } else {
                         setMessage('La puerta está cerrada con llave. Necesitas encontrar cómo abrirla.');
                         playSound(sfxLocked);
                    }
                }
            },
            { id: 'caja_rota', name: 'Caja rota', coords: { top: '72%', left: '30%', width: '7%', height: '7%' },
                action: (state) => {
                    if (!state.flags.sotano_caja_revisada) {
                        setMessage('Remueves unos tablones sueltos y encuentras una vieja llave oxidada.');
                        playSound(sfxItemPickup);
                        addItem('llave_oxidada', 'images/key.png'); // Asegúrate de tener un icono key.png
                        state.flags.sotano_caja_revisada = true;
                    } else {
                        setMessage('Ya has revisado esta caja.');
                    }
                }
            },
             { id: 'tuberia_sotano', name: 'Tubería que gotea', coords: { top: '18%', left: '0%', width: '10%', height: '10%' },
                 action: (state) => {
                     setMessage('Una tubería vieja y oxidada gotea sin cesar. El sonido es inquietante.');
                     // ¡Susto potencial!
                     if (!state.flags.sotano_tuberia_susto && Math.random() < 0.3) { // 30% de probabilidad
                        triggerJumpScare('images/scare1.png', sfxJumpScare1, 700); // Imagen, sonido, duración ms
                        playSound(sfxWhisper); // Un susurro después
                        state.flags.sotano_tuberia_susto = true; // Solo una vez
                     }
                 }
             }
        ],
        flags: { // Banderas para estado específico de la sala
            sotano_puerta_abierta: false,
            sotano_caja_revisada: false,
            sotano_tuberia_susto: false,
        }
    },
    // --- SALA 2: EL PASILLO ---
    pasillo: {
        image: 'images/room2.jpeg',
        message: 'Un pasillo largo y decrépito. Hay varias puertas y un viejo cuadro en la pared. El aire es pesado.',
        backgroundMusic: bgmSuspense,
        objects: [
            { id: 'puerta_biblioteca', name: 'Puerta a la Biblioteca', coords: { top: '55%', left: '69%', width: '2%', height: '5%' },
                action: (state) => {
                    if (state.flags.pasillo_codigo_resuelto) {
                        playSound(sfxDoorCreak);
                        changeRoom('biblioteca');
                    } else {
                        setMessage('Esta puerta tiene un extraño mecanismo con números. Parece necesitar un código de 3 dígitos.');
                        playSound(sfxLocked);
                        // Aquí podrías implementar un prompt para introducir el código
                        const code = prompt("Introduce el código (3 dígitos):");
                        if (code === '482') { // El código correcto
                             setMessage('El mecanismo hace clic y la puerta se desbloquea.');
                             playSound(sfxUnlock);
                             state.flags.pasillo_codigo_resuelto = true;
                        } else if (code) {
                             setMessage('El código es incorrecto. El mecanismo no se mueve.');
                             playSound(sfxLocked);
                             // Susto al fallar?
                             if(Math.random() < 0.4) {
                                playSound(sfxBang);
                             }
                        }
                    }
                }
            },
            { id: 'cuadro_antiguo', name: 'Cuadro antiguo', coords: { top: '42%', left: '26%', width: '1%', height: '5%' },
                action: (state) => {
                     setMessage('Un retrato de aspecto severo. Los ojos parecen seguirte... En la esquina inferior derecha hay un número apenas visible: "8".');
                      // Pista para el código: 482
                }
            },
            { id: 'reloj_parado', name: 'Reloj de pie parado', coords: { top: '41%', left: '42%', width: '2%', height: '4%' },
                action: (state) => {
                     setMessage('Un reloj de abuelo cubierto de polvo. Está parado. Las manecillas marcan las 4 y... ¿el número 2 está arañado?.');
                      // Pista para el código: 482
                }
            },
            // --- DENTRO del array 'objects' de la sala 'pasillo' ---
            // ... (otros objetos como puerta_biblioteca, cuadro_antiguo, etc.) ...
            // ***** NUEVO OBJETO: ENTRADA AL VESTÍBULO *****
            {
                id: 'puerta_vestibulo', // Identificador único
                name: 'Puerta al Vestíbulo Principal', // Nombre descriptivo (o 'Puerta al Vestíbulo')
                // !!! COORDENADAS DE EJEMPLO - ¡¡DEBES AJUSTARLAS!! !!!
                // Busca un lugar adecuado en tu imagen del pasillo (room2.jpg)
                // que parezca una entrada a otra área importante.
                coords: { top: '55%', left: '30%', width: '2%', height: '6%' }, // <-- AJUSTA ESTO!!!
                action: (state) => {
                    // Podrías añadir una condición aquí si quisieras que estuviera bloqueada
                    // al principio (ej: necesitar una llave específica encontrada en otro lugar),
                    // pero por ahora, hacemos que siempre funcione para poder avanzar.

                    setMessage("Atraviesas la puerta hacia lo que parece ser el vestíbulo principal de la mansión.");
                    playSound(sfxDoorCreak); // Puedes usar el chirrido normal o buscar un sonido más 'grande'
                    changeRoom('vestibulo'); // Cambia a la sala final
                }
            },
            // ***** FIN DEL NUEVO OBJETO *****
            // ... (el objeto 'volver_sotano' y otros que tengas) ...
            // --- Objeto 'puerta_dormitorio' DENTRO de la sala 'pasillo' ---
            {
                id: 'puerta_dormitorio',
                name: 'Puerta al Dormitorio',
                coords: { top: '60%', left: '80%', width: '2%', height: '6%' }, // ¡Asegúrate que las coords sean correctas para tu imagen!
                action: (state) => {
                    // ***** INICIO DE LA MODIFICACIÓN *****
                    // Comprobamos la flag de la OTRA sala (dormitorio) para saber si ya se 'desbloqueó' formalmente desde dentro.
                    if (rooms.dormitorio.flags.dormitorio_puerta_abierta) {
                        // Si ya se usó la palanca desde dentro, la puerta se abre normalmente.
                        setMessage("La puerta al dormitorio se abre sin problemas.");
                        playSound(sfxDoorCreak);
                        changeRoom('dormitorio');
                    } else {
                        // *** NUEVA LÓGICA ***
                        // Si la puerta NO ha sido desbloqueada formalmente desde dentro,
                        // permitimos la entrada la PRIMERA VEZ, pero con un mensaje diferente.
                        // La narrativa es que logras forzarla o que estaba solo ligeramente atrancada.
                        setMessage("La puerta parece atascada, pero consigues abrirla con un empujón. Chirría ominosamente al moverse.");
                        playSound(sfxLocked); // Quizás un sonido inicial de forcejeo
                        setTimeout(() => { // Un pequeño retraso antes del chirrido de apertura
                           playSound(sfxDoorCreak);
                           changeRoom('dormitorio'); // ¡Permitimos el paso al dormitorio!
                        }, 300); // 300ms de retraso

                        // NO cambiamos la flag aquí. La flag 'dormitorio_puerta_abierta'
                        // SOLO se pondrá a true cuando uses la palanca desde DENTRO del dormitorio.
                        // Esto mantiene la lógica interna consistente si quieres que el jugador
                        // sienta que realmente 'arregló' la puerta desde el otro lado.
                    }
                    // ***** FIN DE LA MODIFICACIÓN *****
                }
            },
            // ... resto de objetos del pasillo ...


            
             { id: 'volver_sotano', name: 'Puerta al Sótano', coords: { top: '62%', left: '16%', width: '2%', height: '6%' }, // Asumiendo que está a la izquierda
                action: (state) => {
                    playSound(sfxDoorCreak);
                    changeRoom('sotano');
                }
             }
        ],
        flags: {
            pasillo_codigo_resuelto: false,
        }
    },
    // --- SALA 3: LA BIBLIOTECA ---
    biblioteca: {
        image: 'images/room3.jpeg',
        message: 'Una biblioteca llena de libros polvorientos. El silencio es casi total, roto solo por el crujir de la madera vieja.',
        backgroundMusic: bgmCreepy, // Podría tener su propia música más tranquila/inquietante
        objects: [
            { id: 'estanteria_libros', name: 'Estantería', coords: { top: '35%', left: '35%', width: '2%', height: '3%' },
                action: (state) => {
                    if (!state.inventory.includes('engranaje_dorado')) {
                        setMessage('Miles de libros. Uno parece fuera de lugar... ¡Ajá! Detrás de un tomo falso, encuentras un pequeño engranaje dorado.');
                        playSound(sfxItemPickup);
                        addItem('engranaje_dorado', 'images/gear.png'); // Necesitas gear.png
                    } else {
                        setMessage('Ya has buscado bien en las estanterías.');
                    }
                }
            },
            { id: 'escritorio_biblio', name: 'Escritorio', coords: { top: '69%', left: '35%', width: '7%', height: '3%' },
                 action: (state) => {
                     if (!state.flags.biblioteca_nota_leida) {
                         setMessage('Sobre el escritorio hay una nota: "El guardián final requiere el metal del tiempo y el oro del saber..."');
                         state.flags.biblioteca_nota_leida = true;
                         playSound(sfxWhisper); // Susurro al leer la nota
                     } else {
                          setMessage('Ya leíste la nota que había aquí.');
                     }
                 }
            },
             { id: 'puerta_pasillo_biblio', name: 'Puerta al Pasillo', coords: { top: '55%', left: '81%', width: '2%', height: '6%' },
                action: (state) => {
                    playSound(sfxDoorCreak);
                    changeRoom('pasillo');
                }
             }
            // Podría haber un puzzle más complejo aquí (orden de libros, etc.)
        ],
         flags: {
             biblioteca_nota_leida: false,
         }
    },
    // --- SALA 4: EL DORMITORIO --- (Necesitaríamos una forma de llegar, quizás desde la biblioteca o pasillo si se desbloquea)
    dormitorio: {
        image: 'images/room4.jpeg',
        message: 'Un dormitorio inquietante. Una vieja cama con dosel y una mecedora que se mueve sola lentamente...',
        backgroundMusic: bgmSuspense, // Música de cuna distorsionada?
        objects: [
            { id: 'mecedora', name: 'Mecedora', coords: { top: '61%', left: '74%', width: '2%', height: '6%' },
                 action: (state) => {
                    setMessage('La mecedora cruje y se balancea sola. Te da escalofríos.');
                    // Susto: La mecedora se para de golpe y suena un golpe
                    if (!state.flags.dormitorio_mecedora_susto) {
                        setTimeout(() => { // Pequeño delay para el susto
                            playSound(sfxBang);
                            setMessage('¡La mecedora se detiene de golpe!');
                        }, 600);
                         state.flags.dormitorio_mecedora_susto = true;
                    }
                 }
            },
            { id: 'cama_dosel', name: 'Cama con dosel', coords: { top: '83%', left: '39%', width: '2%', height: '6%' },
                 action: (state) => {
                     if (!state.inventory.includes('palanca_metalica')) {
                         setMessage('Buscas bajo la cama polvorienta y encuentras una palanca metálica fría al tacto.');
                         playSound(sfxItemPickup);
                         addItem('palanca_metalica', 'images/crowbar.png'); // Necesitas crowbar.png
                     } else {
                         setMessage('No parece haber nada más de interés en la cama.');
                     }
                 }
            },
            // Añadir puerta para volver (quizás al pasillo)
             { id: 'puerta_pasillo_dorm', name: 'Puerta al Pasillo', coords: { top: '55%', left: '81%', width: '2%', height: '3%' },

                action: (state) => {
                    // 1. Si NO está abierta Y TIENES la palanca:
                    if (!state.flags.dormitorio_puerta_abierta && state.inventory.includes('palanca_metalica')) {
                        setMessage('Usas la palanca para forzar la puerta atascada. ¡Se abre!');
                        playSound(sfxBang);
                        playSound(sfxDoorCreak);
                        state.flags.dormitorio_puerta_abierta = true; // Marcas como abierta
                        // ¿Debería permitir salir AHORA MISMO? Sí, probablemente.
                        changeRoom('pasillo'); // Añadamos esto para salir justo después de usarla
                    }
                    // 2. Si YA está abierta:
                    else if (state.flags.dormitorio_puerta_abierta) {
                        playSound(sfxDoorCreak);
                        changeRoom('pasillo'); // Te deja salir
                    }
                    // 3. Si NO está abierta Y NO TIENES la palanca:
                    else {
                        setMessage('La puerta está bloqueada desde este lado. Parece necesitar algo para forzarla.');
                        playSound(sfxLocked);
                        // !!! NO hay changeRoom aquí !!!
                    }
                }
            }
              

              
        ],
        flags: {
            dormitorio_mecedora_susto: false,
            dormitorio_puerta_abierta: false,
        }
    },
    // --- SALA 5: VESTÍBULO FINAL --- (Acceso desde Pasillo, necesita llave/objeto especial?)
    vestibulo: {
        image: 'images/room5.jpeg',
        message: 'El vestíbulo principal. La gran puerta de salida está frente a ti, pero tiene una cerradura compleja.',
        backgroundMusic: bgmSuspense, // Música más intensa
        objects: [
            { id: 'puerta_salida', name: 'Puerta de Salida', coords: { top: '10%', left: '35%', width: '2%', height: '6%' },
                action: (state) => {
                    // Puzzle final: necesita la palanca y el engranaje? (según la nota de la biblio)
                    if (state.inventory.includes('palanca_metalica') && state.inventory.includes('engranaje_dorado')) {
                        setMessage('Colocas el engranaje dorado en una ranura y usas la palanca metálica en un mecanismo. La cerradura hace un ruido sordo y ¡LA PUERTA SE ABRE! Has escapado... ¿o no?');
                        playSound(sfxUnlock);
                        // Fin del juego
                        endGame(true); // true = victoria
                    } else if (state.inventory.includes('palanca_metalica')) {
                        setMessage('Hay una ranura que parece necesitar algún tipo de engranaje dorado...');
                        playSound(sfxLocked);
                    } else if (state.inventory.includes('engranaje_dorado')) {
                         setMessage('Hay un mecanismo que parece necesitar una palanca resistente para activarlo...');
                         playSound(sfxLocked);
                    } else {
                        setMessage('La cerradura es compleja. La nota de la biblioteca mencionaba "el metal del tiempo y el oro del saber"... Necesitas los objetos correctos.');
                        playSound(sfxLocked);
                    }
                }
            },
            { id: 'volver_pasillo_vestibulo', name: 'Volver al Pasillo', coords: { top: '80%', left: '45%', width: '2%', height: '6%' }, // Puerta atrás
                action: (state) => {
                     // Decidir cómo se entra aquí, ¿quizás una puerta específica del pasillo?
                     // Por ahora, asumimos que se puede volver.
                     playSound(sfxDoorCreak);
                     changeRoom('pasillo'); // O desde donde se acceda
                }
            }
            // Podrías añadir más elementos decorativos o sustos aquí
        ],
        flags: {}
    },
};

// --- Funciones del Juego ---

function startGame() {
    startScreen.style.display = 'none';
    gameContainer.style.display = 'flex'; // O 'block' según tu CSS final
    inventory = []; // Reinicia inventario
    // Reinicia todas las flags del juego (importante si se puede rejugar)
    for (const roomKey in rooms) {
        if (rooms[roomKey].flags) {
             const flagKeys = Object.keys(rooms[roomKey].flags);
             flagKeys.forEach(flag => {
                 // ¡Cuidado! Esto reinicia las flags a su valor inicial definido arriba
                 // Si necesitas reiniciar a 'false' específicamente:
                 // rooms[roomKey].flags[flag] = false;
                 // Por ahora, asumimos que el estado inicial es el correcto para reiniciar
                 // Si no, tendrás que definir un estado inicial explícito y copiarlo aquí.
                 // Ejemplo simple reiniciando a false:
                  const initialFlags = rooms[roomKey].initialFlags || rooms[roomKey].flags; // Si defines initialFlags
                  rooms[roomKey].flags = { ...initialFlags }; // Copia limpia
             });
        }
    }
    updateInventory();
    changeRoom('sotano'); // Empezar en el sótano
    playMusic(bgmCreepy); // Empezar música
}

function changeRoom(roomId) {
    if (!rooms[roomId]) {
        console.error(`Error: La sala "${roomId}" no existe.`);
        return;
    }
    currentRoom = rooms[roomId];
    roomImage.src = currentRoom.image;
    setMessage(currentRoom.message); // Muestra el mensaje inicial de la sala
    clearActionMessage(); // Limpia mensaje de acción anterior
    renderInteractiveObjects();
    playMusic(currentRoom.backgroundMusic); // Cambia la música si es diferente
     console.log(`Cambiado a la sala: ${roomId}`);
}

function renderInteractiveObjects() {
    // Limpiar objetos anteriores
    const existingAreas = roomElement.querySelectorAll('.interactive-area');
    existingAreas.forEach(area => area.remove());

    if (currentRoom.objects) {
        currentRoom.objects.forEach(obj => {
            const area = document.createElement('div');
            area.classList.add('interactive-area');
            area.style.top = obj.coords.top;
            area.style.left = obj.coords.left;
            area.style.width = obj.coords.width;
            area.style.height = obj.coords.height;
            area.dataset.objectId = obj.id; // Guardamos el ID para saber qué se clickeó
            area.title = obj.name; // Tooltip con el nombre

            area.addEventListener('click', () => handleInteraction(obj.id));
            roomElement.appendChild(area);
        });
    }
}

function handleInteraction(objectId) {
    const obj = currentRoom.objects.find(o => o.id === objectId);
    if (obj && obj.action) {
        console.log(`Interactuando con: ${objectId}`);
        // Pasamos el estado actual del juego (inventario y flags de la sala actual)
        const gameState = {
            inventory: inventory,
            flags: currentRoom.flags || {} // Pasa un objeto vacío si no hay flags definidas
        };
        obj.action(gameState);
    } else {
        console.warn(`Objeto interactivo no encontrado o sin acción: ${objectId}`);
         setMessage("No puedes interactuar con eso."); // Mensaje genérico
    }
}

function setMessage(text) {
    roomMessage.textContent = text;
    clearActionMessage(); // Limpiar acción si se muestra mensaje de sala
}

function setActionMessage(text) {
    actionMessage.textContent = text;
}

function clearActionMessage() {
     actionMessage.textContent = "";
}

function addItem(itemId, itemIcon = 'images/item_default.png') { // Añade un icono por defecto
    if (!inventory.includes(itemId)) {
        inventory.push(itemId);
        updateInventory(itemIcon); // Pasa el icono
        setActionMessage(`Has recogido: ${itemId.replace(/_/g, ' ')}`); // Mensaje más legible
        playSound(sfxItemPickup);
    }
}

function removeItem(itemId) {
     const index = inventory.indexOf(itemId);
     if (index > -1) {
         inventory.splice(index, 1);
         updateInventory(); // Actualizar sin icono específico al quitar
          setActionMessage(`Has usado: ${itemId.replace(/_/g, ' ')}`);
     }
}

function updateInventory(iconForLastItem = null) {
    inventoryList.innerHTML = ''; // Limpiar lista
    inventory.forEach((item, index) => {
        const li = document.createElement('li');
        const img = document.createElement('img');
        // Usa el icono específico si es el último item añadido y se proporcionó
        img.src = (index === inventory.length - 1 && iconForLastItem) ? iconForLastItem : `images/${item}.png`; // Asume icono con nombre de item
        img.alt = item;
        // Fallback si la imagen específica no carga
        img.onerror = () => { img.src = 'images/item_default.png'; }; // Usa un icono genérico si falla
        li.appendChild(img);
        li.appendChild(document.createTextNode(item.replace(/_/g, ' '))); // Nombre legible
        inventoryList.appendChild(li);
    });
}


function playSound(audioElement) {
    if (!isMuted && audioElement) {
         // Reinicia el audio si ya está sonando para poder repetirlo rápido (ej: click)
         audioElement.currentTime = 0;
        audioElement.play().catch(e => console.log("Error al reproducir audio:", e));
    }
}

function playMusic(musicElement) {
    if (currentBGM === musicElement && !currentBGM.paused) return; // Ya suena la correcta

     // Detener música anterior
     if (currentBGM) {
         currentBGM.pause();
         currentBGM.currentTime = 0; // Reiniciar por si se vuelve a ella
     }

     currentBGM = musicElement;

    if (!isMuted && currentBGM) {
        currentBGM.volume = 0.3; // Volumen más bajo para BGM
        currentBGM.play().catch(e => console.log("Error al reproducir música:", e));
    }
}

function stopMusic() {
    if (currentBGM) {
        currentBGM.pause();
        currentBGM.currentTime = 0;
    }
    currentBGM = null;
}


function toggleMute() {
    isMuted = !isMuted;
    muteButton.textContent = isMuted ? '🔇 Unmute' : '🔊 Mute';
    if (isMuted) {
        if (currentBGM) currentBGM.pause();
        // Podrías pausar también SFX activos si tuvieras un control más complejo
    } else {
        if (currentBGM) currentBGM.play().catch(e => console.log("Error al volver a reproducir música:", e));
        // No reanudar SFX automáticamente
    }
}

function triggerJumpScare(imageSrc, soundEffect, duration = 1000) {
    console.log("¡SUSTO!");
    jumpscareImage.src = imageSrc;
    jumpscareElement.classList.remove('jumpscare-hidden');
    jumpscareElement.classList.add('jumpscare-visible');
    playSound(soundEffect);

    setTimeout(() => {
        jumpscareElement.classList.remove('jumpscare-visible');
        jumpscareElement.classList.add('jumpscare-hidden');
    }, duration);
}

function endGame(isVictory) {
    stopMusic(); // Detiene la música al final
    gameContainer.style.display = 'none'; // Oculta juego

    // Crear pantalla final dinámicamente
    const endScreen = document.createElement('div');
    endScreen.id = 'end-screen'; // Reutilizar estilo si quieres
    endScreen.style.textAlign = 'center';
    endScreen.style.padding = '30px';
     endScreen.style.backgroundColor = '#111';
     endScreen.style.border = '2px solid #500';
     endScreen.style.borderRadius = '10px';

    const title = document.createElement('h1');
     title.style.fontFamily = "'Creepster', cursive";
      title.style.color = isVictory ? '#4CAF50' : '#b71c1c'; // Verde victoria, Rojo derrota


    const message = document.createElement('p');

    if (isVictory) {
         title.textContent = '¡Has Escapado!';
        message.textContent = 'Lograste abrir la puerta y salir a la fría noche. Eres libre... por ahora.';
         playSound(sfxUnlock); // Sonido final de victoria (quizás otro?)

    } else {
        // Aún no hay condición de derrota, pero podrías añadirla (tiempo, error fatal)
         title.textContent = 'Atrapado para Siempre';
        message.textContent = 'El tiempo se agotó o cometiste un error fatal. La mansión te reclama...';
         playSound(sfxJumpScare1); // Sonido de derrota
    }

     const restartButton = document.createElement('button');
     restartButton.textContent = 'Jugar de Nuevo';
     restartButton.style.padding = '10px 20px';
     restartButton.style.fontSize = '1.2em';
     restartButton.style.cursor = 'pointer';
     restartButton.style.backgroundColor = '#444';
     restartButton.style.color = 'white';
     restartButton.style.border = 'none';
     restartButton.style.borderRadius = '5px';
     restartButton.style.marginTop = '20px';
     restartButton.onclick = () => {
         document.body.removeChild(endScreen); // Quitar pantalla final
         startScreen.style.display = 'block'; // Mostrar pantalla inicial de nuevo
     };

    endScreen.appendChild(title);
    endScreen.appendChild(message);
     endScreen.appendChild(restartButton);
    document.body.appendChild(endScreen); // Añadir al body
}

// --- Inicialización ---
startButton.addEventListener('click', startGame);
muteButton.addEventListener('click', toggleMute);

// Precargar audio (mejora rendimiento, pero puede tardar al inicio)
// Comenta esto si prefieres carga bajo demanda
window.addEventListener('load', () => {
    bgmSuspense.load();
    bgmCreepy.load();
    sfxJumpScare1.load();
    sfxDoorCreak.load();
    sfxItemPickup.load();
    sfxUnlock.load();
    sfxLocked.load();
    sfxWhisper.load();
    sfxBang.load();
     console.log("Recursos de audio precargados (o intentado).");
});
