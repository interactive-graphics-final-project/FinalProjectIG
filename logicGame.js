if (WEBGL.isWebGLAvailable() === false) {
    document.body.appendChild(WEBGL.getWebGLErrorMessage());
}

// FPS UI
/*(function () {
    var script = document.createElement('script');
    script.onload = function () {
        var stats = new Stats();
        document.body.appendChild(stats.dom);
        requestAnimationFrame(function loop() {
            stats.update();
            requestAnimationFrame(loop)
        });
    };
    script.src = '//mrdoob.github.io/stats.js/build/stats.min.js';
    document.head.appendChild(script);
})();*/
//============================================================================


// loader
// create an AudioListener and add it to the camera
var listener = new THREE.AudioListener();

var shooting = false;
var godmode = false;
var camera, controls, scene, renderer;
var width = window.innerWidth;
var height = window.innerHeight;
// mouse position
var mouseX = 0, mouseY = 0;
// stars array
var stars = [];
// asteroid array
var asteroids = [], radiusAsteroids = 80;
// Bullets array
var bullets = [], bulletsB = [], shoot = true;
// sounds array
var sounds = [], soundEffectExplosion = false, battleAlarm = false;
;

//flag bullet swapping dx and sx
var sx = true;
var turbo = false;
var spaceShip = null, typeSpaceShip = 0;
var modelLoaded = false;
var pause = false, start = false, gameOver = false, victory = false, stopAnimation = false;
var score = 0, health = 100, healthBoss = 100, lvl = 1;

// textureLoader variable
var textureLoader = new THREE.TextureLoader();
var objectLoader = new THREE.ObjectLoader();

function startGame() {
    // !!important
    start = true;
    pause = false;
    gameOver = false;

    // reset boss position
    boss.model.rotation.z = -Math.PI / 2;
    boss.model.rotation.y = -Math.PI / 2;
    boss.model.position.z = -10000;
    boss.model.position.y = -1;

    //reset sounds
    sounds = [];

    //playSound
    playSound("AsteroidChase", true, false);

    // init variable
    health = 100;
    healthBoss = 100;
    score = 0;

    // disable auto rotation and orbit control
    controls.reset();
    controls.enabled = false;

    // reset the score and the health
    document.getElementById("score").innerHTML = "Score: " + score.toFixed(2);

    document.getElementById("valueHealthPlayer").style.width = '100%';
    document.getElementById("valueHealthBoss").style.width = '100%';

    // hide the main menu
    hideHtml("mainMenu", true);

    // show the score and health (initialized)
    showHtml("score", false);
    // show health player
    showHtml("playerHealth", false);
    showHtml("titlePlayerHealth", false);


    // set camera position based on the model loaded
    switch (typeSpaceShip) {
        case 0:
            camera.position.z = 5;
            playSound("TIE-fighterFly", true, true);
            break;
        case 2:
            camera.position.z = 15;
            playSound("ARCFly", true, true);
            break;
    }
}

function reloadGame() {
    document.getElementById('Container').style.display = "none";
    document.getElementById('modal').style.display = "block";
    location.reload(true)
}

function switchShip(type) {
    // button spaceShip underline
    var elem = document.getElementsByClassName("ship");
    for (var i = 0; i < elem.length; i++)
        elem[i].style.textDecoration = "none";
    document.getElementById(type).style.textDecoration = "underline";
    // ==========================

    scene.remove(spaceShip);
    if (type === 0) {
        camera.position.z = 5;
        loadModel("star-wars-vader-tie-fighter", type);
    }
    if (type === 1) {
        //loadModel("x-wing");
    }
    if (type === 2) {
        camera.position.z = 15;
        loadModel("star-wars-arc-170-pbr", type);
    }
}

function switchLvl(level) {
    var elem = document.getElementsByClassName("lvl");
    for (var i = 0; i < elem.length; i++)
        elem[i].style.textDecoration = "none";
    document.getElementById("lvl" + level).style.textDecoration = "underline";
    lvl = level;
}

//=============================================================================

scene = new THREE.Scene();

//renderer
renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('Container').appendChild(renderer.domElement);

//camera
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 9000);
// event listener
window.addEventListener('resize', function () {
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
document.addEventListener("keydown", function (event) {
    var keyCode = event.which;
    // p key
    if (keyCode === 84) {
        turbo = true;
    }
    // g key
    if (keyCode === 71) {
        godmode = !godmode;
    }
    // escape key
    if (keyCode === 27) {
        if (start === true) {
            pause = !pause;
            if (pause === true) {
                showHtml("secondMenu", true);
                pauseAllSounds()
            } else {
                hideHtml("secondMenu", true);
                playAllSounds()
            }

        }
    }
}, false);
document.addEventListener("keyup", function (event) {
    var keyCode = event.which;
    // p key
    if (keyCode === 84) {
        turbo = false;
    }
}, false);
document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX - width / 2;
    mouseY = e.clientY - height / 2
}, false);
document.addEventListener('click', function (e) {
    shooting = true;
    //playSound
    if (start === true && pause === false && gameOver === false) {
        switch (typeSpaceShip) {
            case 0:
                playSound("TIE-fighterFire", false, true);
                break;
            case 2:
                playSound("ARCFire", false, true);
                break;
        }
    }

}, false);
//prevent text selection with double click
document.addEventListener('mousedown', function (event) {
    if (event.detail > 1) {
        event.preventDefault();
    }
}, false);
//===================================================================================================

// controls command in the main menu
controls = new THREE.OrbitControls(camera, renderer.domElement);

function starForge() {
    // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
    for (var z = 0; z < 1000; z += 1) {
        // Make a sphere (exactly the same as before).
        var geometry = new THREE.SphereGeometry(0.5, 32, 32);
        var material = new THREE.MeshBasicMaterial({color: 0xffffff, reflectivity: 0.1});
        var sphere = new THREE.Mesh(geometry, material);
        // This time we give the sphere random x and y positions between -500 and 500
        sphere.position.x = Math.random() * 3000 - 1500;
        sphere.position.y = Math.random() * 3000 - 1500;
        sphere.position.z = Math.random() * 3000 - 1500;
        // scale it up a bit
        sphere.scale.x = sphere.scale.y = 2;
        // move the stars too close to the camera
        if (sphere.position.z < 0 && sphere.position.z > -50) {
            sphere.position.x = sphere.position.x -= 100;
        }
        if (sphere.position.z >= 0 && sphere.position.z < 50) {
            sphere.position.x = sphere.position.x += 100;
        }
        //add the sphere to the scene
        scene.add(sphere);
        //finally push it to the stars array
        stars.push(sphere);

    }
}

function asteroidForge() {
    asteroids = [];
    // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
    var i = -7000;
    for (var z = -7000; z < -500; z += 30) {
        // Make a sphere (exactly the same as before).
        textureLoader.load('./models/texture/asteroid.png', function (texture) {
            var geometry = new THREE.SphereBufferGeometry(radiusAsteroids, Math.random() * 4 + 3, Math.random() * 6 + 5); // 3 32
            var material = new THREE.MeshPhongMaterial({map: texture, reflectivity: 0.1});
            var asteroid = new THREE.Mesh(geometry, material);

            // This time we give the sphere random x and y positions between -500 and 500
            asteroid.position.x = Math.random() * 2000 - 1000;
            asteroid.position.y = Math.random() * 1000 - 500;
            // Then set the z position to where it is in the loop (distance of camera)
            asteroid.position.z = i;
            //add the sphere to the scene
            scene.add(asteroid);
            //finally push it to the stars array
            asteroids.push(asteroid);
            i += 30;
        });
    }
}

// non cancellare
starForge();
asteroidForge();

//model textureLoader
function loadModel(name, typeSShip) {
    // BEGIN Clara.io JSON textureLoader code
    objectLoader.load("./models/" + name + ".json", function (obj) {
            scene.add(obj);
            typeSpaceShip = typeSShip;
            spaceShip = obj;
            if (modelLoaded) {
                switch (typeSShip) {
                    case 0:
                        spaceShip.position.y = -1;
                        spaceShip.position.x = -0.4;
                        break;
                    case 2:
                        spaceShip.position.y = -4.5;
                        spaceShip.position.x = -0.4;
                        break;
                }
            }
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            if ((xhr.loaded / xhr.total * 100) === 100) {
                modelLoaded = true;
            }
        },
        // called when loading has errors
        function (error) {
            console.log('An error happened' + error);
        });
    // END Clara.io JSON textureLoader code
}

loadModel("star-wars-vader-tie-fighter", typeSpaceShip);

// planet creation
textureLoader.load('./models/texture/sun.jpg', function (texture) {
    var geometry = new THREE.SphereBufferGeometry(340, 32, 32);
    var material = new THREE.MeshBasicMaterial({map: texture});
    var sphere = new THREE.Mesh(geometry, material);

    sphere.position.set(200, 900, -1500);
    var light1 = new THREE.PointLight(0xffb04a, 4, 0, 2);
    light1.position.set(534, 200, -966);
    light1.add(sphere);
    scene.add(light1);
});
textureLoader.load('./models/texture/earth.jpg', function (texture) {
    var geometry = new THREE.SphereBufferGeometry(230, 32, 32);
    var material = new THREE.MeshPhongMaterial({map: texture, reflectivity: 0.2});
    var earth = new THREE.Mesh(geometry, material);

    earth.position.set(-1700, -90, -2183);
    scene.add(earth);
});
// =================================================================================================
var boss = new SpaceShipBossModel("boss");
boss.model.rotation.z = -Math.PI / 2;
boss.model.rotation.y = -Math.PI / 2;
boss.model.position.z = -10000;
boss.model.position.y = -1;
scene.add(boss.model);

// lights
var light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

// init camera position
camera.position.z = 5;
var bossVerticalMovement = 0;
var bossHorizzontalMovement = 0;


//game Logic
function update() {

    if (modelLoaded === true) {
        if (start === true && pause === false && gameOver === false && victory === false) {

            // management of victory and game over
            if (healthBoss <= 0 && victory === false) {
                if (soundEffectExplosion === false)
                    playSound("TIE-fighterExplode", false, false);
                soundEffectExplosion = true;

                if (healthBoss <= 0 && victory === false) {
                    victory = true;
                    pauseAllSounds();
                }

                showHtml("victory", true);
            }
            if (health <= 0 && gameOver === false) {
                gameOver = true;
                pauseAllSounds();

                showHtml("gameOver", true);
            }
            // if not gameover and not victory spaceship could move
            else {
                spaceShip.position.x = mouseX * 0.008;
                spaceShip.position.y = (-mouseY) * 0.01 + (typeSpaceShip === 0 ? 0 : -5);
                spaceShip.rotation.z = mouseX * (typeSpaceShip === 0 ? 0.0007 : 0.00001);

                if (turbo === true) {
                    if ((spaceShip.position.z) > -5)
                        spaceShip.position.z -= 0.2;
                } else {
                    if ((spaceShip.position.z) < 0)
                        spaceShip.position.z += 0.2;
                }
            }

            // =============================== MANAGEMENT OF BOSS bullets + movement ==========================
            if (score >= lvl * 0.5) {
                if (battleAlarm === false) {
                    // show health boss
                    showHtml("bossHealth", false);
                    showHtml("titleBossHealth", false);
                    playSound("BattleAllarm", false, false);
                }
                battleAlarm = true;
                //loop through each asteroids
                if (asteroids.length !== 0) {
                    for (var iAst = 0; iAst < asteroids.length; iAst++) {
                        asteroids[iAst].position.z += lvl * 18;
                        asteroids[iAst].rotation.x += iAst / 5100;
                        asteroids[iAst].rotation.z += iAst / 5500;
                        if (turbo === true)
                            asteroids[iAst].position.z += 10;
                        // if the particle is too close move it to the back
                        if (asteroids[iAst].position.z > 500) {
                            asteroids[iAst].position.z = -11000;
                            scene.remove(asteroids[iAst]);
                            asteroids.splice(iAst, 1);
                            continue;
                        }
                        if (!godmode) {
                            if (asteroids[iAst].position.distanceTo(spaceShip.position) <= (4.5 + radiusAsteroids + 2)) {
                                health -= 3 * lvl;
                                if (health >= 0)
                                    document.getElementById("valueHealthPlayer").style.width = health + '%';
                            }
                        }
                    }
                }

                if (boss.model.position.z < -50)
                    boss.model.position.z += 50;
                if (boss.model.position.z <= -50)
                    baseCannon.rotation.x = -0.01 * spaceShip.position.x;

                boss.model.position.x = 3 * Math.cos(bossHorizzontalMovement += 0.02);
                if (health > 0)
                    boss.model.position.y = spaceShip.position.y;
                    leftWing.rotation.z = spaceShip.position.y * 0.2;
                    rightWing.rotation.z = spaceShip.position.y * 0.2;



                for (var iBBull = 0; iBBull < bulletsB.length; iBBull += 1) {

                    // if the bullets position on z axis < -200 ill remove it
                    if (bulletsB[iBBull].position.z > 100) {
                        scene.remove(bulletsB[iBBull]);
                        bulletsB[iBBull].alive = false;
                    }
                    if (bulletsB[iBBull] === undefined) continue;
                    if (bulletsB[iBBull].alive === false) {
                        bulletsB.splice(iBBull, 1);
                        continue;
                    }
                    bulletsB[iBBull].position.add(bulletsB[iBBull].velocity);

                    if (!godmode) {
                        if (spaceShip.position.distanceTo(bulletsB[iBBull].position) <= (0.06 + 2)) {
                            health -= 0.3 * lvl;
                            if (health >= 0)
                                document.getElementById("valueHealthPlayer").style.width = health + '%';
                        }
                    }
                }

                // boss shoot !!
                setTimeout(function () {
                    shoot = !shoot
                }, 2000);
                if (boss.model.position.z === -50 && shoot === true) {

                    var geometryb = new THREE.CylinderGeometry(0.05, 0.05, 3, 12);
                    var materialb = new THREE.MeshBasicMaterial({
                        color: 0xff0000,
                        refractionRatio: 0.98,
                        reflectivity: 0.9
                    });
                    var bulletb = new THREE.Mesh(geometryb, materialb);
                    bulletb.rotation.z = Math.PI / 2;
                    bulletb.rotation.y = Math.PI / 2;
                    // position the bullet to come from the player's weapon

                    bulletb.position.set(boss.model.position.x, boss.model.position.y + 1.4, boss.model.position.z + 3);

                    // set the velocity of the bullet
                    bulletb.velocity = new THREE.Vector3(
                        -Math.sin(baseCannon.rotation.x),
                        0,
                        Math.cos(baseCannon.rotation.x)
                    );

                    bulletb.alive = true;
                    //bulletb.rotation.x = cannon.rotation.x;
                    // add to scene, array, and set the delay to 10 frames
                    scene.add(bulletb);
                    bulletsB.push(bulletb);
                }
                // normal management of asteroids
            } else {

                // loop through each asteroids
                for (var iAst = 0; iAst < asteroids.length; iAst++) {
                    asteroids[iAst].position.z += lvl * 18;
                    asteroids[iAst].rotation.x += iAst / 5100;
                    asteroids[iAst].rotation.z += iAst / 5500;
                    if (turbo === true)
                        asteroids[iAst].position.z += 10;
                    // if the particle is too close move it to the back
                    if (asteroids[iAst].position.z > 500) {
                        asteroids[iAst].position.z = -7000;
                        asteroids[iAst].position.x = Math.random() * 2000 - 1000;
                    }

                    if (!godmode) {
                        if (asteroids[iAst].position.distanceTo(spaceShip.position) <= (4.5 + radiusAsteroids + 2)) {
                            health -= 3 * lvl;
                            if (health >= 0)
                                document.getElementById("valueHealthPlayer").style.width = health + '%';
                        }
                    }
                }
            }

            // ========================  MANAGEMENT OF BULLETS PLAYER  ============================
            // go through bullets array and update position - remove bullets when appropriate
            for (var iBull = 0; iBull < bullets.length; iBull += 1) {

                // if the bullets position on z axis < -200 ill remove it
                if (bullets[iBull].position.z < -200) {
                    scene.remove(bullets[iBull]);
                    bullets[iBull].alive = false;
                }
                if (bullets[iBull] === undefined) continue;
                if (bullets[iBull].alive === false) {
                    bullets.splice(iBull, 1);
                    continue;
                }
                bullets[iBull].position.add(bullets[iBull].velocity);

                if (boss.model.position.distanceTo(bullets[iBull].position) <= (0.06 + 2)) {
                    healthBoss -= 3 / lvl;
                    score += 0.1;
                    document.getElementById("score").innerHTML = "Score: " + score.toFixed(2);
                    if (health >= 0)
                        document.getElementById("valueHealthBoss").style.width = healthBoss + '%';
                }

                // loop through each asteroids
                for (iAst = 0; iAst < asteroids.length; iAst++) {
                    // computation of the Euclidian distance for the bullet detection
                    if (asteroids[iAst].position.distanceTo(bullets[iBull].position) <= (0.06 + radiusAsteroids + 2)) {
                        //update score
                        score += 0.1;
                        document.getElementById("score").innerHTML = "Score: " + score.toFixed(2);
                        playSound("TIE-fighterExplode", false, false);

                        // target hit - remove the bullet
                        scene.remove(bullets[iBull]);
                        // place the asteroids in the init position
                        asteroids[iAst].position.z = score < 0.5 ? -7100 : 100;
                        bullets[iBull].alive = false;
                    }
                }
            }
            // left click - user shoot
            if (shooting === true && health > 0) {
                var geometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 12);
                var material = new THREE.MeshBasicMaterial({
                    //color: (typeSpaceShip === 0 ? 0xff0000 : 0x00ff00),
                    color: 0x00ff00,
                    refractionRatio: 0.98,
                    reflectivity: 0.9
                });
                var bullet = new THREE.Mesh(geometry, material);
                bullet.rotation.x = Math.PI / 2;
                // position the bullet to come from the player's weapon
                if (sx === true)
                    bullet.position.set(spaceShip.position.x + (typeSpaceShip === 0 ? 0.17 : -13.7), spaceShip.position.y + 0.6, spaceShip.position.z - (typeSpaceShip === 0 ? 2.5 : 9));
                else
                    bullet.position.set(spaceShip.position.x + (typeSpaceShip === 0 ? 0.45 : 13.7), spaceShip.position.y + 0.6, spaceShip.position.z - (typeSpaceShip === 0 ? 2.5 : 9));

                sx = !sx;

                // set the velocity of the bullet
                bullet.velocity = new THREE.Vector3(
                    -Math.sin(spaceShip.rotation.x),
                    0,
                    -Math.cos(spaceShip.rotation.x)
                );

                bullet.alive = true;
                // add to scene, array, and set the delay to 10 frames
                scene.add(bullet);
                bullets.push(bullet);
            }
            if (sx === false)
                shooting = false;

        } else if (start === false) {
            controls.autoRotate = true;
            controls.update();
        }

        //management of end game with gameover
        if (gameOver === true && stopAnimation === false) {
            setTimeout(function () {
                stopAnimation = true
            }, 3000);

            spaceShip.rotation.y += 0.2;
            spaceShip.position.y -= 0.05;
            spaceShip.position.z -= 0.2;
            spaceShip.position.x += 0.1;
            if (soundEffectExplosion === false) {
                switch (typeSpaceShip) {
                    case 0:
                        playSound("TIE-fighterExplode", false, true);
                        break;
                    case 2:
                        playSound("ARCExplode", false, true);
                        break;
                }
            }
            soundEffectExplosion = true;

            for (var iBBull = 0; iBBull < bulletsB.length; iBBull += 1) {

                // if the bullets position on z axis < -200 ill remove it
                if (bulletsB[iBBull].position.z > 100) {
                    scene.remove(bulletsB[iBBull]);
                    bulletsB[iBBull].alive = false;
                }
                if (bulletsB[iBBull] === undefined) continue;
                if (bulletsB[iBBull].alive === false) {
                    bulletsB.splice(iBBull, 1);
                    continue;
                }
                bulletsB[iBBull].position.add(bulletsB[iBBull].velocity);

                if (spaceShip.position.distanceTo(bulletsB[iBBull].position) <= (0.06 + 2)) {
                    health -= 3 / lvl;
                    if (health >= 0)
                        document.getElementById("valueHealthPlayer").style.width = health + '%';
                }
            }
        }


    }
}

function showHtml(id, cursor) {
    document.getElementById(id).style.display = "block";
    if (cursor)
        document.body.style.cursor = "auto";
}

function hideHtml(id, cursor) {
    document.getElementById(id).style.display = "none";
    if (cursor)
        document.body.style.cursor = "none";
}

// sound functions
function playSound(name, loop, positional) {
// create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    camera.add(listener);

// create the PositionalAudio object (passing in the listener)
    var sound = new THREE.PositionalAudio(listener);

// load a sound and set it as the PositionalAudio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load('sounds/' + name + '.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(loop);
        sound.setRefDistance(20);
        sound.play();
    });
    if (positional)
        spaceShip.add(sound);
    else
        scene.add(sound);

    if (loop === true)
        sounds.push(sound);
}

function pauseAllSounds() {
    for (var i = 0; i < sounds.length; i++) {
        sounds[i].pause();
    }
}

function playAllSounds() {
    for (var i = 0; i < sounds.length; i++) {
        sounds[i].play();
    }
}

// =================================  draw Scene  ============================
// structural TRHEE JS functions
function render() {
    renderer.render(scene, camera);
}

// run game loop (update, render, repeat)
function GameLoop() {

    requestAnimationFrame(GameLoop);
    update();
    render();

}

// creation of the stars
GameLoop();