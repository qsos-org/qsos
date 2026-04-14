<template>
    <nav id="menu-process">
        <ul>
            <li id="define">
                <div class="octogon">
                    <h2>{{ $t('menu.section_define') }}</h2>
                    <ul>
                        <li>
                            <NuxtLink to="/software-types/">{{ $t('menu.types_of_software') }}</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/licenses">{{ $t('menu.licenses') }}</NuxtLink>
                        </li>
                    </ul>

                </div>
            </li>
            <li id="evaluate">
                <div class="octogon">
                    <h2>{{ $t('menu.section_evaluate') }}</h2>
                    <ul>
                        <li>
                            <NuxtLink to="/software-types?intent=grids">{{ $t('menu.evaluation_grids') }}</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/software-types?intent=evaluate">{{ $t('menu.evaluate_software') }}</NuxtLink>
                        </li>
                    </ul>
                </div>
            </li>
            <li id="qualify">
                <div class="octogon">
                    <h2>{{ $t('menu.section_qualify') }}</h2>
                    <ul>
                        <li>
                            <NuxtLink v-if="userUid" :to="`/users/${userUid}/requirements-presets?intent=manage`">{{
                                $t('menu.requirements_presets') }}</NuxtLink>
                            <NuxtLink v-else to="/auth/">{{ $t('menu.requirements_presets') }}</NuxtLink>
                        </li>
                    </ul>
                </div>
            </li>
            <li id="select">
                <div class="octogon">
                    <h2>{{ $t('menu.section_select') }}</h2>
                    <ul>
                        <li>
                            <NuxtLink to="/software-types?intent=compare">{{ $t('menu.compare_softwares') }}</NuxtLink>
                        </li>
                    </ul>
                </div>
            </li>
        </ul>
        <svg fill="#000000" height="200px" width="200px" version="1.1" id="circular-arrow"
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 297.249 297.249"
            xml:space="preserve">
            <g>
                <path d="M67.851,120.957H53.267c8.152-28,28.685-51.807,55.359-63.768L95.645,27.605c-38.193,16.976-66.903,51.352-75.728,93.352H0
		l33.435,55.413L67.851,120.957z" />
                <path d="M175.624,53.268c28,8.152,52.14,28.685,64.101,55.359l29.418-12.981c-16.976-38.193-51.519-66.903-93.519-75.728V0
		l-55.413,33.436l55.413,34.414V53.268z" />
                <path d="M263.813,120.544l-34.414,55.413h14.582c-8.152,28-28.685,51.973-55.359,63.934l12.982,29.502
		c38.193-16.975,66.903-51.435,75.727-93.435h19.918L263.813,120.544z" />
                <path d="M120.624,243.981c-28-8.152-51.639-28.685-63.6-55.358l-29.668,12.98c16.976,38.193,51.268,66.903,93.268,75.727v19.918
		l55.414-33.436l-55.414-34.415V243.981z" />
            </g>
        </svg>
    </nav>
</template>

<script setup lang="ts">
import { getEmailUser } from '~/services/user';

const { user } = useUserSession();
const userUid = computed(() => {
    return user.value ? getEmailUser(user.value) : null;

});
</script>

<style>
#menu-process {
    position: relative;
    text-align: center;
}

#menu-process>ul {
    width: 600px;
    height: 600px;
    margin: 0 auto;
    list-style-type: none;
    padding: 0;
    display: grid;
    gap: 0.5em;
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
    counter-reset: listCounter;
}

#menu-process>ul>li {
    position: relative;
    counter-increment: listCounter;
}

.octogon {
    background-color: #f9f9f9;
    transition: background-color 0.5s ease-out;
    aspect-ratio: 1;
    padding: 1em;
    --o: calc(50%*tan(-22.5deg));
    clip-path: polygon(var(--o) 50%, 50% var(--o),
            calc(100% - var(--o)) 50%,
            50% calc(100% - var(--o)));
    display: flex;
    flex-direction: column;
}

#menu-process #define .octogon {
    background-color: hsl(from var(--brand-define) h calc(s - 10) calc(l + 30));
}

#menu-process #evaluate .octogon {
    background-color: hsl(from var(--brand-evaluate) h s calc(l + 20));
}

#menu-process #qualify .octogon {
    background-color: hsl(from var(--brand-qualify) h calc(s - 10) calc(l + 30));
}

#menu-process #select .octogon {
    background-color: hsl(from var(--brand-select) h calc(s - 10) calc(l + 30));
}

#menu-process #define:hover .octogon {
    background-color: hsl(from var(--brand-define) h calc(s - 10) calc(l + 20))
}

#menu-process #evaluate:hover .octogon {
    background-color: hsl(from var(--brand-evaluate) h s calc(l + 10));
}

#menu-process #qualify:hover .octogon {
    background-color: hsl(from var(--brand-qualify) h calc(s - 10) calc(l + 20));
}

#menu-process #select:hover .octogon {
    background-color: hsl(from var(--brand-select) h calc(s - 10) calc(l + 20));
}

#select {
    order: 3;
}

#qualify {
    order: 4;
}

#menu-process #circular-arrow {
    content: url("/assets/images/circular-arrow.svg");
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotateY(180deg);
    width: 200px;
    height: 200px;
}

#menu-process>ul>li::before {
    content: counter(listCounter);
    position: absolute;
    height: 70px;
    width: 70px;
    color: black;
    font-weight: 500;
    line-height: 1;
    font-size: 2rem;
    aspect-ratio: 1;
    padding: 0.25em;
    transition: transform 0.5s ease-out;
}

#menu-process #define::before {
    top: 0px;
    left: 0px;
    --dark: var(--brand-define);
    --light: hsl(from var(--brand-define) h calc(s - 10) calc(l + 20));
    background: linear-gradient(to right bottom, var(--light) 0%, var(--light) 40%, var(--dark) 46%, var(--dark) 100%);
    clip-path: polygon(0 0, 0 100%, 100% 0);
    text-align: left;
}

#menu-process #evaluate::before {
    top: 0px;
    right: 0px;
    --dark: var(--brand-evaluate);
    --light: hsl(from var(--brand-evaluate) h calc(s - 10) calc(l + 20));
    background: linear-gradient(to left bottom, var(--light) 0%, var(--light) 40%, var(--dark) 46%, var(--dark) 100%);
    clip-path: polygon(100% 0, 100% 100%, 0 0);
    text-align: right;
}

#menu-process #qualify::before {
    bottom: 0px;
    right: 0px;
    --dark: var(--brand-qualify);
    --light: hsl(from var(--brand-qualify) h calc(s - 10) calc(l + 20));
    background: linear-gradient(to left top, var(--light) 0%, var(--light) 40%, var(--dark) 46%, var(--dark) 100%);
    clip-path: polygon(100% 100%, 100% 0, 0 100%);
    text-align: right;
    align-content: end;
}

#menu-process #select::before {
    bottom: 0px;
    left: 0px;
    --dark: var(--brand-select);
    --light: hsl(from var(--brand-select) h calc(s - 10) calc(l + 20));
    background: linear-gradient(to right top, var(--light) 0%, var(--light) 40%, var(--dark) 46%, var(--dark) 100%);
    clip-path: polygon(0 0, 0 100%, 100% 100%);
    text-align: left;
    align-content: end;
}

#menu-process .octogon ul {
    list-style: none;
    padding: 0.5rem 0 4rem 0;
    flex: 1;
    justify-content: center;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
}
</style>